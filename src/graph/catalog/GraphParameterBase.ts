import type { GraphJsonValue } from "../document/GraphJsonValue";
import type { GraphParameterValidation } from "./GraphParameterValidation";
import type { GraphVisibilityExpression } from "./GraphVisibilityExpression";

export interface GraphParameterBase {
  id: string;
  label: string;
  description?: string;
  required?: boolean;
  defaultValue?: GraphJsonValue;
  placeholder?: string;
  visibility?: GraphVisibilityExpression;
  validation?: GraphParameterValidation[];
  metadata?: Record<string, GraphJsonValue>;
}
