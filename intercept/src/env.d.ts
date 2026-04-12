/**
 * Augment the CloudflareEnv interface (declared by @opennextjs/cloudflare)
 * with project-specific bindings from wrangler.toml.
 */

/** Minimal Workers AI binding type — covers the `ai.run()` pattern. */
interface WorkersAiBinding {
  run<T = unknown>(
    model: string,
    inputs: Record<string, unknown>,
    options?: Record<string, unknown>
  ): Promise<T>
}

declare global {
  interface CloudflareEnv {
    /** Workers AI binding configured in wrangler.toml: [ai] binding = "AI" */
    AI?: WorkersAiBinding
  }
}

export {}
