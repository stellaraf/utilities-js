/**
 * Determine if a request is _likely_ to be from a browser.
 */
export function isBrowserRequest(request: Request): boolean {
  const userAgent = request.headers.get("user-agent");
  const accept = request.headers.get("accept");
  const mozilla = (userAgent?.match(/.*Mozilla.*/gi) ?? []).length !== 0;
  const html = (accept?.match(/.*text\/html.*/gi) ?? []).length !== 0;
  return mozilla && html;
}
