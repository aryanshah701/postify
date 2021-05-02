import { FieldError, UserInput } from "./types";

export const isValidEmail = (email: string): boolean => {
  const mailFormat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return mailFormat.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

export const isValidUsername = (username: string): boolean => {
  return username.length >= 3;
};

export const validateUser = (options: UserInput): FieldError[] | null => {
  if (!isValidUsername(options.username)) {
    return [
      {
        field: "username",
        message: "Sorry, the username needs to be > 2 characters.",
      },
    ];
  }

  if (!isValidEmail(options.email)) {
    return [
      {
        field: "email",
        message: "Please enter a valid email address",
      },
    ];
  }

  if (!isValidPassword(options.password)) {
    return [
      {
        field: "password",
        message: "Sorry, the password needs to be > 7 characters.",
      },
    ];
  }

  return null;
};
