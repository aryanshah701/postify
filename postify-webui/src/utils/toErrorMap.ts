import { FieldError } from "../generated/graphql";

export const toErrorMap = (fieldErrors: FieldError[]) => {
  const errorMap: any = {};
  fieldErrors.forEach(({ field, message }) => {
    if (field) {
      errorMap[field] = message;
    }
  });

  return errorMap;
};
