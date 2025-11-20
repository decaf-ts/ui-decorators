import {
  formatDate,
  Model,
  parseDate,
  ReservedModels,
} from "@decaf-ts/decorator-validation";
import { HTML5DateFormat, HTML5InputTypes, UIKeys } from "./constants";
import { InternalError } from "@decaf-ts/db-decorators";
import { FieldProperties } from "./types";
import { DecorationKeys, Metadata } from "@decaf-ts/decoration";

export function getUIAttributeKey(prop: string, key: string) {
  return Metadata.key(UIKeys.REFLECT, DecorationKeys.PROPERTIES, prop, key);
}

/**
 * @function formatByType
 *
 * @memberOf module:ui-decorators
 */
export function formatByType(
  type: any,
  value: any,
  ...args: unknown[]
): string | number {
  if (type === UIKeys.DATE) {
    if (!value) return "";
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
    case Array.name: {
      const parsed = Array.isArray(value)
        ? value.map((v) =>
            parseValueByType(
              ReservedModels.STRING.name.toLowerCase(),
              v,
              fieldProps
            )
          )
        : [value];
      result = parsed.join(",");
      break;
    }
    case HTML5InputTypes.NUMBER:
      result = parseToNumber(value);
      break;
    case HTML5InputTypes.DATE: {
      const format: string | undefined = fieldProps.format;
      if (value && `${value}`.trim().length) {
        result =
          typeof value === ReservedModels.NUMBER.name.toLowerCase()
            ? new Date(value)
            : value
              ? format
                ? parseDate(format, value)
                : new Date(value)
              : undefined;
      }
      break;
    }
    default:
      result =
        typeof value === ReservedModels.OBJECT.name.toLowerCase()
          ? Array.isArray(value)
            ? value.join(",")
            : JSON.stringify(value)
          : typeof value === ReservedModels.BOOLEAN.name.toLowerCase()
            ? value
            : typeof value === ReservedModels.STRING.name.toLowerCase()
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
  if (!value) return value;

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
  let id: string | number | bigint = Date.now();
  try {
    const pk = Model.pk(model.constructor);
    if (pk)
      id = model[Model.pk(model.constructor) as keyof typeof model] as
        | string
        | number;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e: unknown) {
    // do nothing;
  }
  const name = model.constructor.name;
  return `${name}-${id}`;
}
