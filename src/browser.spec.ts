import { isBrowserRequest } from "./browser";

it("is probably a browser", () => {
  const request = new Request("https://www.example.com", {
    headers: { accept: "text/html;andstuff", "user-agent": "Mozilla/5.0" },
  });
  expect(isBrowserRequest(request)).toBe(true);
});

it("is probably not a browser", () => {
  const request1 = new Request("https://www.example.com", {
    headers: { accept: "application/json" },
  });
  const request2 = new Request("https://www.example.com");
  const request3 = new Request("https://example.com", { headers: { accept: "text/html" } });
  expect(isBrowserRequest(request1)).toBe(false);
  expect(isBrowserRequest(request2)).toBe(false);
  expect(isBrowserRequest(request3)).toBe(false);
});
