import {
  formatDate,
  Model,
  parseDate,
  ReservedModels,
} from "@decaf-ts/decorator-validation";
import { HTML5DateFormat, HTML5InputTypes, UIKeys } from "./constants";
import { findModelId, InternalError } from "@decaf-ts/db-decorators";
import { FieldProperties } from "./types";

/**
 * @function formatByType
 *
 * @memberOf ui-decorators-web.ui
 */
export function formatByType(
  type: any,
  value: any,
  ...args: unknown[]
): string | number {
  if (type === UIKeys.DATE) {
    const format: string = (args.shift() as string) || HTML5DateFormat;
    return formatDate(new Date(value), format);
  }
  return value;
}

export function parseValueByType(
  type: string,
  value: string | number,
  fieldProps: FieldProperties
): string | number | Date {
  let result: string | number | Date | undefined = undefined;
  switch (type) {
    case HTML5InputTypes.NUMBER:
      result = parseToNumber(value);
      break;
    case HTML5InputTypes.DATE:
      const format: string | undefined = fieldProps.format;
      result =
        typeof value === ReservedModels.NUMBER
          ? new Date(value)
          : !!value
            ? format
              ? parseDate(format, value)
              : new Date(value)
            : undefined;
      break;
    default:
      result =
        typeof value === ReservedModels.STRING
          ? escapeHtml(value as string)
          : result;
  }
  if (typeof result === "undefined") {
    throw new InternalError(
      `Failed to parse value of type ${type} from ${typeof value} - ${value}`
    );
  }
  return result;
}

export function parseToNumber(value: string | number) {
  if (typeof value === "number" && !isNaN(value)) return value;

  const parsed = Number(value);
  if (!isNaN(parsed)) return parsed;

  return undefined;
}

export function escapeHtml(value: string) {
  if (!value) return undefined;

  const tagsToReplace: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
  };
  return `${value}`.replace(/[&<>]/g, (tag) => {
    return tagsToReplace[tag] || tag;
  });
}

export function revertHtml(value: string) {
  const tagsToReplace: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
  };

  return `${value}`.replace(/&lt;|&gt;|&amp;/g, (tag) => {
    return tagsToReplace[tag] || tag;
  });
}

export function generateUIModelID<M extends Model>(model: M) {
  let id: string | number;
  try {
    id = findModelId(model);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e: unknown) {
    id = Date.now();
  }
  const name = model.constructor.name;
  return `${name}-${id}`;
}
