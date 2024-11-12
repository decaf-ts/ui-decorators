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
