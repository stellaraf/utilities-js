export type Dict<T extends unknown = unknown> = { [key: string]: T };

export type DictOf<T extends unknown, P extends keyof T> = { [K in P]: T[K] };

export type Entryable<T extends unknown> = Dict<T> | [string, T][] | Map<string, T>;

export type Primitive = null | undefined | string | number | boolean | symbol | bigint;

export type HTTPMethod = "GET" | "POST" | "PATCH" | "PUT" | "OPTIONS" | "DELETE" | "HEAD";

// @ts-ignore
export type JSONAble =
  | Dict<Dict | Primitive | Array<Dict> | JSONAble>
  | Array<Dict<JSONAble> | Primitive | JSONAble>;

export type Timeout = ReturnType<typeof setTimeout>;
