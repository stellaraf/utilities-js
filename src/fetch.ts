import is from "@sindresorhus/is";
import { merge } from "merge-anything";
import { byteSize, objectPop } from "./generic";

import type { HTTPMethod, JSONAble } from "./types";

export function mergeHeaders(...toMerge: HeadersInit[]): Headers {
  const headers = new Headers();
  for (const item of toMerge) {
    if (typeof item !== "undefined") {
      if (item instanceof Headers) {
        item.forEach((v, k) => {
          headers.append(k, v);
        });
      } else if (is.plainObject(item)) {
        for (const [k, v] of Object.entries(item)) {
          headers.append(k, v);
        }
      } else if (Array.isArray(item)) {
        for (const [k, v] of item) {
          headers.append(k, v);
        }
      }
    }
  }
  return headers;
}

function mergeReqResInit<I extends RequestInit | ResponseInit>(...inits: I[]): I {
  const headersToMerge = inits.reduce<HeadersInit[]>((f, e) => {
    if (typeof e.headers !== "undefined") {
      f.push(e.headers);
    }
    return f;
  }, []);
  const headers = mergeHeaders(...headersToMerge);
  const initsToMerge = inits.map((i) => objectPop(i, "headers")) as I[];
  const merged = merge<I, I[]>({} as I, ...initsToMerge, { headers } as I);
  return merged as unknown as I;
}

export const mergeRequestInit = (...i: RequestInit[]): RequestInit => mergeReqResInit(...i);
export const mergeResponseInit = (...i: ResponseInit[]): ResponseInit => mergeReqResInit(...i);

// export function mergeRequestInit(...inits: RequestInit[]): RequestInit {
//   const headersToMerge = inits.reduce<HeadersInit[]>((f, e) => {
//     if (typeof e.headers !== "undefined") {
//       f.push(e.headers);
//     }
//     return f;
//   }, []);
//   const headers = mergeHeaders(...headersToMerge);
//   const initsToMerge = inits.map((i) => objectPop(i, "headers"));
//   return merge<RequestInit, RequestInit[]>({} as RequestInit, ...initsToMerge, { headers });
// }

/**
 * Convenience function to create a JSON response with proper headers.
 * @param data Any JSON-able Data.
 * @param status HTTP Status Code.
 */
export function JSONResponse<T extends unknown>(
  data: T,
  status: number,
  extraHeaders: HeadersInit = [],
): Response {
  const body = JSON.stringify(data);
  const size = byteSize(body);
  const jsonHeaders = new Headers([
    ["content-type", "application/json;charset=UTF-8"],
    ["content-length", size.toString()],
  ]);

  const headers = mergeHeaders(jsonHeaders, extraHeaders);
  return new Response(body, { status, headers });
}

/**
 * Create a file download response with proper headers.
 *
 * @param buf Buffer of file data.
 * @param filename File name.
 * @param contentType Content-Type, should conform to standard MIME types.
 * @see https://www.iana.org/assignments/media-types/media-types.xhtml
 */
export function FileResponse<B extends ArrayBuffer>(
  buf: B,
  filename: string,
  contentType: string,
  init: RequestInit = {},
): Response {
  const headers = new Headers([
    ["content-disposition", "attachment"],
    ["filename", filename],
    ["content-type", contentType],
    ["content-length", Math.round(buf.byteLength).toString()],
  ]);
  const merged = mergeResponseInit({ headers, status: 200 }, init);
  return new Response(buf, merged);
}

export function JSONRequest<J extends JSONAble>(
  url: string | URL,
  method: HTTPMethod,
  json: J,
  extraHeaders: HeadersInit = {},
  options: RequestInit = {},
): Request {
  const body = JSON.stringify(json);
  const { size } = new Blob([body]);
  const headers = new Headers([
    ["content-type", "application/json"],
    ["user-agent", "stellar/sfhub"],
    ["content-length", size.toString()],
  ]);
  const merged = mergeRequestInit({ method, body, headers }, { headers: extraHeaders }, options);
  return new Request(url, merged);
}

export function EmptyRequest(
  url: string | URL,
  method: HTTPMethod,
  extraHeaders: HeadersInit = {},
  options: RequestInit = {},
): Request {
  const headers = new Headers([["user-agent", "stellar/sfhub"]]);

  const merged = mergeRequestInit({ method, headers }, { headers: extraHeaders }, options);
  return new Request(url, merged);
}
