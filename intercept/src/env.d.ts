/**
 * Augment the CloudflareEnv interface (declared by @opennextjs/cloudflare)
 * with project-specific bindings from wrangler.toml.
 */

declare global {
  /** Minimal Cloudflare KV namespace type — covers get/put used for rate limiting. */
  interface KVNamespace {
    get(key: string): Promise<string | null>
    put(
      key: string,
      value: string,
      options?: { expirationTtl?: number; expiration?: number }
    ): Promise<void>
  }

  /** Minimal Workers AI binding type — covers the `ai.run()` pattern. */
  interface WorkersAiBinding {
    run<T = unknown>(
      model: string,
      inputs: Record<string, unknown>,
      options?: Record<string, unknown>
    ): Promise<T>
  }

  interface CloudflareEnv {
    /** Workers AI binding configured in wrangler.toml: [ai] binding = "AI" */
    AI?: WorkersAiBinding
    /** KV namespace for distributed rate limiting. wrangler.toml: [[kv_namespaces]] binding = "RATE_LIMIT" */
    RATE_LIMIT?: KVNamespace
  }
}

export {}
