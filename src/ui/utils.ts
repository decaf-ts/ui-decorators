import {
  formatDate,
  Model,
  ValidationKeys,
} from "@decaf-ts/decorator-validation";
import { HTML5DateFormat, UIKeys, ValidatableByAttribute } from "./constants";

/**
 * @function formatByType
 *
 * @memberOf ui-decorators-web.ui
 */
const formatByType = function (type: any, value: any) {
  switch (type) {
    case UIKeys.DATE:
      return formatDate(new Date(value), HTML5DateFormat);
    default:
      return value;
  }
};

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

//
//
// export function getValidationsByAttribute<M extends Model>(
//   validationProperties: UIPropertyDecoratorDefinition[],
//   validationsByType: ValidationsByKey
// ): ValidationsByKey {
//   const parseValueByKey = function (key, value, prop) {
//     if (!value) return value;
//
//     switch (key) {
//       case ValidationKeys.PATTERN:
//         const regexp = new RegExp(`^/(.+)/[gimuy]*$`, "g");
//         const match = regexp.exec(value);
//         return match ? match[1] : match;
//       case ValidationKeys.MIN:
//       case ValidationKeys.MAX:
//         if (prop in validationsByType)
//           return formatByType(Object.keys(validationsByType[prop])[0], value);
//       default:
//         return value;
//     }
//   };
//   return validationProperties.reduce((accum, vp) => {
//     accum[vp.prop] = vp.decorators.reduce((ac, decorator) => {
//       if (decorator.key in ValidatableByAttribute) {
//         let parsedValue = parseValueByKey(
//           decorator.key,
//           decorator.props["value"],
//           vp.prop
//         );
//         if (typeof parsedValue === "undefined") parsedValue = "true";
//         ac[decorator.key] = parsedValue;
//       }
//       return ac;
//     }, {});
//     return accum;
//   }, {});
// }
