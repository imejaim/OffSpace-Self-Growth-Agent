// PayPal REST API helper — MVP용 (fetch only, no axios)
// 환경변수: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_MODE
//
// Important: on Cloudflare Workers with nodejs_compat, secrets declared via
// `wrangler secret put` are surfaced through `getCloudflareContext().env`, NOT
// through `process.env`. Using `process.env` alone silently returns undefined
// in production (this is how the payment flow was failing).

type TokenCache = {
  token: string;
  expiresAt: number;
};

let tokenCache: TokenCache | null = null;

/**
 * Resolve a secret / env var from the Cloudflare runtime context if available,
 * falling back to `process.env` (nodejs runtime / local dev).
 */
export async function resolveEnv(key: string): Promise<string | undefined> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const val = (env as any)?.[key];
    if (typeof val === "string" && val.length > 0) return val;
  } catch {
    // Not in Cloudflare runtime
  }
  const fromProcess = process.env?.[key];
  if (typeof fromProcess === "string" && fromProcess.length > 0) return fromProcess;
  return undefined;
}

export async function getPayPalApiBase(): Promise<string> {
  const mode = await resolveEnv("PAYPAL_MODE");
  return mode === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export async function generateAccessToken(): Promise<string> {
  const now = Date.now();

  // Return cached token if still valid (with 60s buffer)
  if (tokenCache && now < tokenCache.expiresAt - 60_000) {
    return tokenCache.token;
  }

  const clientId = await resolveEnv("PAYPAL_CLIENT_ID");
  const clientSecret = await resolveEnv("PAYPAL_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials missing: PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET not set");
  }

  const apiBase = await getPayPalApiBase();
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${apiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Failed to generate PayPal access token: ${await response.text()}`);
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };

  tokenCache = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };

  return tokenCache.token;
}

export async function createOrder(amount: string, currency: string): Promise<unknown> {
  const apiBase = await getPayPalApiBase();
  const accessToken = await generateAccessToken();

  const response = await fetch(`${apiBase}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount,
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create PayPal order: ${await response.text()}`);
  }

  return response.json();
}

export async function captureOrder(orderId: string): Promise<unknown> {
  const apiBase = await getPayPalApiBase();
  const accessToken = await generateAccessToken();

  const response = await fetch(`${apiBase}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to capture PayPal order (${orderId}): ${await response.text()}`);
  }

  return response.json();
}

export async function createSubscription(planId: string, customId?: string): Promise<unknown> {
  const apiBase = await getPayPalApiBase();
  const accessToken = await generateAccessToken();

  const payload: Record<string, unknown> = { plan_id: planId };
  if (customId) payload.custom_id = customId;

  const response = await fetch(`${apiBase}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to create PayPal subscription (plan: ${planId}): ${await response.text()}`);
  }

  return response.json();
}

export async function getSubscriptionDetails(subscriptionId: string): Promise<unknown> {
  const apiBase = await getPayPalApiBase();
  const accessToken = await generateAccessToken();

  const response = await fetch(`${apiBase}/v1/billing/subscriptions/${subscriptionId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get PayPal subscription details (${subscriptionId}): ${await response.text()}`);
  }

  return response.json();
}

export async function verifyWebhookSignature(
  headers: Headers,
  body: string,
  webhookId: string
): Promise<boolean> {
  const apiBase = await getPayPalApiBase();
  const accessToken = await generateAccessToken();

  const transmissionId = headers.get("PAYPAL-TRANSMISSION-ID");
  const transmissionTime = headers.get("PAYPAL-TRANSMISSION-TIME");
  const transmissionSig = headers.get("PAYPAL-TRANSMISSION-SIG");
  const certUrl = headers.get("PAYPAL-CERT-URL");
  const authAlgo = headers.get("PAYPAL-AUTH-ALGO");

  if (!transmissionId || !transmissionTime || !transmissionSig || !certUrl || !authAlgo) {
    throw new Error("Missing required PayPal webhook headers for signature verification");
  }

  const response = await fetch(`${apiBase}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transmission_id: transmissionId,
      transmission_time: transmissionTime,
      transmission_sig: transmissionSig,
      cert_url: certUrl,
      auth_algo: authAlgo,
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    }),
  });

  if (!response.ok) {
    throw new Error(`PayPal webhook signature verification request failed: ${await response.text()}`);
  }

  const data = (await response.json()) as { verification_status: string };
  return data.verification_status === "SUCCESS";
}
