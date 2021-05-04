import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Textarea,
} from "@chakra-ui/react";
import { useField } from "formik";
import React, { ComponentType, InputHTMLAttributes } from "react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  isTextarea?: boolean;
};

// A generic input field using formik and chakra
export const InputField: React.FC<InputFieldProps> = ({
  label,
  isTextarea,
  size: _,
  ...props
}) => {
  const [field, { error }] = useField(props);
  let InputComponent: any = isTextarea ? Textarea : Input;
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={props.name}>{label}</FormLabel>
      <InputComponent {...field} {...props} id={field.name} />
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
};
