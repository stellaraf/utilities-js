import { objectHasProperty } from "./generic";

export function isDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.valueOf());
}

export function isRequest(trigger: unknown): trigger is Request {
  return objectHasProperty(trigger, "url", "headers", "body", "method");
}
