export type PayPalEnv = {
    PAYPAL_CLIENT_ID: string;
    PAYPAL_CLIENT_SECRET: string;
    PAYPAL_MODE?: string;
};

// ADDED: PayPal API Base URL 분기 — sandbox/production 자동 전환
export function getPayPalApiBase(env: Pick<PayPalEnv, "PAYPAL_MODE">): string {
    return env.PAYPAL_MODE === "production"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";
}

// ADDED: OAuth 2.0 Client Credentials 방식으로 Access Token 발급
export async function generateAccessToken(
    clientId: string,
    clientSecret: string,
    apiBase: string
): Promise<string> {
    const auth = btoa(`${clientId}:${clientSecret}`);
    const response = await fetch(`${apiBase}/v1/oauth2/token`, {
        method: "POST",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    });

    if (!response.ok) {
        throw new Error(`Failed to generate Access Token: ${await response.text()}`);
    }

    const data = await response.json() as { access_token: string };
    return data.access_token;
}
