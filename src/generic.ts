import dayjs from "dayjs";
import is from "@sindresorhus/is";

import type { DictOf, Entryable, Primitive, Timeout } from "./types";

export interface ListFromObjectOptions {
  title?: string;
  /** @default true */
  html?: boolean;
}

interface UrlQueryOptions {
  /**
   * Base URL. If specified, output will be prefixed as such. Otherwise, a relative path is returned.
   * @default undefined (urlQuery will return a relative path)
   */
  baseUrl: string;
}

/**
 * Remove undefined properties from an object.
 */
export function cleanObject<T extends object>(obj: T): T {
  const clean = {} as T;
  for (const [k, v] of Object.entries(obj)) {
    const key = k as keyof T;
    if (typeof v !== "undefined") {
      clean[key] = v;
    }
  }
  return clean;
}

/**
 * Determine if a value is not an empty string, empty object, empty array, null, or undefined.
 *
 * @param value
 */
export function isTruthy<T extends unknown>(value: T): value is NonNullable<T> {
  if (value === false) {
    return false;
  }
  if (value === true) {
    return true;
  }
  if (is.nan(value)) {
    return false;
  }
  const nonNullUndefined = typeof value !== "undefined" && value !== null;
  if (typeof value === "string") {
    return !["", "null", "undefined"].includes(value);
  }
  if (is.plainObject(value) && Object.keys(value).length === 0) {
    return false;
  }
  if (is.array(value) && value.length === 0) {
    return false;
  }
  return nonNullUndefined;
}

/**
 * Truncate a string to a length of `chars`.
 *
 * @param fullString Original string
 * @param chars Maximum length
 */
export function truncateString(fullString: string, chars: number): string {
  if (typeof fullString !== "string") {
    return truncateString(String(fullString), chars);
  }
  const maxLength = chars - 3;
  if (fullString.length > chars) {
    return `${fullString.slice(0, maxLength)}...`;
  }
  return fullString;
}

/**
 * Generate an HTML unordered list from object keys/values.
 *
 * @param obj Object from which to generate the list.
 * @param title Optional title. If supplied, it will be bold above the list.
 */
export function listFromObject(
  obj: Record<string, unknown>,
  options: ListFromObjectOptions = {},
): string {
  const { title, html = true } = options;
  let items: string[] = [];
  if (html === true) {
    items = ["<ul>"];
  }
  for (const [key, value] of Object.entries(obj)) {
    const item = html === true ? `<li><b>${key}</b>: ${value}</li>` : ` - ${key}: ${value}`;
    items = [...items, item];
  }
  if (html === true) {
    items = [...items, "</ul>"];
  }

  if (typeof title === "string") {
    if (html === true) {
      items = [`<b>${title}</b><br />`, ...items];
    } else {
      items = [title, ...items];
    }
  }
  if (html === true) {
    return items.join("");
  }
  return items.join("\n");
}

export function setAsyncTimeout(ms: number): Promise<Timeout> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determine if an object has a given method or property.
 *
 * @param obj Object to check
 * @param props Properties or methods to look for
 */
export function objectHasProperty<O extends unknown>(obj: O, ...props: string[]): boolean {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  const set = new Set();
  for (const prop of Object.getOwnPropertyNames(Object.getPrototypeOf(obj))) {
    set.add(prop);
  }
  for (const prop of Object.getOwnPropertyNames(obj)) {
    set.add(prop);
  }
  const all = Array.from(set);
  for (const prop of props) {
    if (!all.includes(prop)) {
      return false;
    }
  }
  return true;
}

/**
 * Determine if an object is a specific type by a given method or property.
 *
 * @param obj Object to check
 * @param props Properties or methods to look for
 */
export function objectIsTypeByProp<T extends unknown, P extends keyof T = keyof T>(
  obj: unknown,
  ...props: P[]
): obj is DictOf<T, P> {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  const set = new Set();
  for (const prop of Object.getOwnPropertyNames(Object.getPrototypeOf(obj))) {
    set.add(prop);
  }
  for (const prop of Object.getOwnPropertyNames(obj)) {
    set.add(prop);
  }
  const all = Array.from(set);
  for (const prop of props) {
    if (!all.includes(prop)) {
      return false;
    }
  }
  return true;
}

/**
 * Convert a string to a file-friendly format.
 *
 * @param original Original string
 * @returns File-friendly string
 * @example
 * ```js
 * console.log(fileFriendlyString("Customer Name"));
 * // customer-name
 * ```
 */
export function fileFriendlyString(original: string): string {
  return original.replace(/\s/gi, "-").toLowerCase();
}

/**
 * Format a `Date` object as a Matt Love preferred date string, i.e. YYYYMMDD.
 *
 * @param date Date object
 * @returns formatted string
 * @example
 * ```js
 * console.log(dateString(new Date(1661437058530)));
 * // 20220825
 * ```
 */
export function dateString(date: Date): string {
  return dayjs(date).format("YYYYMMDD");
}

/**
 * Creates an array of grouped elements, the first of which contains the first elements of the given arrays, the second of which contains the second elements of the given arrays, and so on.
 *
 * @see https://lodash.com/docs/4.17.15#zip
 * @see https://gist.github.com/renaudtertrais/25fc5a2e64fe5d0e86894094c6989e10
 *
 * @param all Array/arrays to ZIP
 * @returns Zipped Array
 * @example
 * ```js
 * console.log(zip([1, 2, 3], [1, 2, 3], [1, 2, 3]));
 * // [
 * //   [1, 1, 1],
 * //   [2, 2, 2],
 * //   [3, 3, 3],
 * // ]
 * ```
 */
export function zip<T extends unknown, A extends Array<T> = Array<T>>(...all: A[]): T[][] {
  const [first, ...rest] = all;
  return first.map((val, i) => rest.reduce((a, arr) => [...a, arr[i]], [val]));
}

/**
 * Generate a random string.
 *
 * @param length Length of string @default 32
 * @param base @default ""
 * @returns
 */
export function randomString(length: number = 32, base: string = ""): string {
  // eslint-disable-next-line no-param-reassign
  base += Math.random().toString(20).substring(2, length);
  return base.length > length ? base.slice(0, length) : randomString(length, base);
}

/**
 * Convert a Map to an object, typically for JSON serialization.
 *
 * @param map Map to convert
 * @returns Converted object
 */
export function mapToObject<K extends string, V extends unknown, M extends Map<K, V>>(
  map: M,
): Record<K, V> {
  const obj = {} as Record<K, V>;
  for (const [key, value] of map.entries()) {
    obj[key] = value;
  }
  return obj;
}

/**
 * Convert a `Headers` object to a standard `Map`.
 */
export function headersToMap<H extends Headers>(headers: H): Map<string, string> {
  const map = new Map<string, string>();
  headers.forEach((value, key) => {
    map.set(key, value);
  });
  return map;
}

export function parseJSON<Expected>(data: string): Expected {
  try {
    const parsed = JSON.parse(data);
    return parsed as Expected;
  } catch (err) {
    throw new TypeError(`Failed to parse JSON data from '${data}'`);
  }
}

export function parseCommaSeparatedNumbers(raw: string | null): number[] {
  if (raw === null) {
    return [];
  }
  return raw
    .split(",")
    .map((r) => parseInt(r.trim(), 10))
    .filter((r) => !isNaN(r));
}

export async function errorMessageFromBadResponse(res: Response): Promise<string> {
  const body = await res.text();
  try {
    const json = JSON.parse(body);
    if (objectIsTypeByProp<{ error: string }>(json, "error") && typeof json.error === "string") {
      return json.error;
    }
    return String(json);
  } catch (err) {
    return `[${res.status}] ${res.statusText}`.trim();
  }
}

/**
 * Stringify input data as form data.
 *
 * @param data Input data, must be a plain object, array of k/v pairs, or a map.
 * @returns stringified data.
 *
 * @example
 * ```ts
 * const body = toFormData({one: 1, two: 2});
 * console.log(body);
 * // one=1&two=2
 * ```
 * In case you forgot, form data does _not_ get prepended with `?`
 */
export function toFormData<D extends Entryable<Primitive>>(data: D): string {
  let params: URLSearchParams;

  const stringify = (e: [string, unknown]): [string, string] => [e[0], String(e[1])];

  if (is.plainObject(data)) {
    params = new URLSearchParams(Object.entries(data).map(stringify));
  } else if (is.array(data)) {
    params = new URLSearchParams(data.map(stringify));
  } else if (is.map(data)) {
    params = new URLSearchParams(Array.from(data.entries()).map(stringify));
  } else {
    throw new TypeError("Input data must be a plain object, array of k/v pairs, or a map");
  }
  return params.toString();
}

/**
 * Create a URL (relative or otherwise) with query/search params.
 *
 * @param url URL
 * @param query Query object/map/array from which to derive query param string.
 * @param options urlQuery options
 *
 * @example
 * ```ts
 * const url = urlQuery("/path/to/thing", {key: "value"});
 * console.log(url);
 * // /path/to/thing?key=value
 * ```
 * @returns
 */
export function urlQuery<Q extends Entryable<Primitive>>(
  url: string,
  query?: Q,
  options: Partial<UrlQueryOptions> = {},
): string {
  const defaultBase = "https://www.example.com";

  const { baseUrl = defaultBase } = options;
  const urlObj = new URL(url, baseUrl);

  if (is.plainObject(query)) {
    for (const [key, value] of Object.entries(query) as [string, Primitive][]) {
      urlObj.searchParams.set(key, String(value));
    }
  }
  if (is.map(query)) {
    for (const [key, value] of query.entries()) {
      urlObj.searchParams.set(key, String(value));
    }
  }
  if (is.array<[string, Primitive]>(query)) {
    for (const [key, value] of query) {
      urlObj.searchParams.set(key, String(value));
    }
  }
  return urlObj.toString().replace(defaultBase, "");
}

/**
 * Determine if a string contains _only_ numbers.
 *
 * @param str input string
 * @returns `true` if string contains only numbers, `false` if non-numeric characters exist.
 */
export function isNumberString(str: string): boolean {
  const pattern = /^\d+$/;
  return Boolean(str.match(pattern)?.length);
}

export function chunkArray<T extends readonly unknown[] | []>(array: T, chunkN: number): T[] {
  let chunks: T[] = [];
  let idx = 0;
  const originalLen = array.length;

  while (idx < originalLen) {
    chunks = [...chunks, array.slice(idx, (idx += chunkN)) as T];
  }
  return chunks;
}

export async function settleSplitPromises<T extends unknown>(
  values: T[],
  splitN: number,
): Promise<PromiseSettledResult<Awaited<T>>[]> {
  const groups = chunkArray(values, splitN);
  let results: PromiseSettledResult<Awaited<T>>[] = [];
  for (const group of groups) {
    const result = await Promise.allSettled(group);
    results = [...results, ...result];
  }
  return results;
}

export function byteSize(value: string): number {
  const blob = new Blob([value]);
  return Math.round(blob.size);
}

export function objectPop<K extends string, O extends Partial<Record<K, unknown>>>(
  obj: O,
  ...keys: K[]
): { [R in Exclude<keyof O, K>]: O[R] } {
  const dup = {} as O;
  for (const key of keys) {
    if (!objectHasProperty(obj, key)) {
      dup[key] = obj[key];
    }
  }
  return dup;
}
