export type PostResult<T = unknown> = { status: number; data: T | null };

/**
 * POST JSON with a hard timeout. Resolves with the HTTP status even for 4xx
 * (the booking flow needs 400/409). Rejects on network failure or timeout.
 */
export async function postJSON<T = unknown>(
  url: string | undefined,
  body: unknown,
  { timeoutMs = 15000 }: { timeoutMs?: number } = {},
): Promise<PostResult<T>> {
  if (!url) throw new Error("Webhook URL is not configured");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    let data: T | null = null;
    try {
      data = (await res.json()) as T;
    } catch {
      data = null;
    }
    return { status: res.status, data };
  } finally {
    clearTimeout(timer);
  }
}
