import { mergeRequestInit } from "./fetch";
import { objectIsTypeByProp, toFormData } from "./generic";

import type { Entryable, Primitive } from "./types";

export function checkEnv<E extends Record<string, unknown>>(
  env: E,
  required: (keyof E)[],
): (keyof E)[] {
  const requirements = Array.from(new Set(required));
  const missing = [] as string[];

  for (const name of requirements) {
    if (!objectIsTypeByProp<E>(env, name)) {
      missing.push(name as string);
    }
  }
  return missing;
}

/**
 * `POST` an object as form data.
 *
 * @param url Target URL
 * @param data Object to url-encode and send as form data.
 */
export async function postForm(
  url: string,
  data: Entryable<Primitive>,
  init: RequestInit = {},
): Promise<Response> {
  const body = toFormData(data);
  const headers = new Headers([["content-type", "application/x-www-form-urlencoded"]]);
  const reqInit = mergeRequestInit({ body, method: "POST", headers }, init);
  const request = new Request(url, reqInit);
  return fetch(request);
}
