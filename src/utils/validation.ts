export const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const isValidPhone = (value: string) =>
  /^[+]?[\d\s-]{8,}$/.test(value.trim());

export const isValidPassword = (value: string) => value.length >= 8;

export const required = (value: string) => value.trim().length > 0;

export type FieldErrors = Record<string, string | undefined>;

export function validateLogin(input: {email: string; password: string}): FieldErrors {
  const errors: FieldErrors = {};
  if (!required(input.email)) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(input.email)) {
    errors.email = 'Enter a valid email';
  }
  if (!required(input.password)) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(input.password)) {
    errors.password = 'Minimum 8 characters';
  }
  return errors;
}

export function validateSignup(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!required(input.firstName)) {
    errors.firstName = 'First name is required';
  }
  if (!required(input.lastName)) {
    errors.lastName = 'Last name is required';
  }
  if (!required(input.email)) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(input.email)) {
    errors.email = 'Enter a valid email';
  }
  if (!required(input.phone)) {
    errors.phone = 'Phone is required';
  } else if (!isValidPhone(input.phone)) {
    errors.phone = 'Enter a valid phone number';
  }
  if (!required(input.password)) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(input.password)) {
    errors.password = 'Minimum 8 characters';
  }
  if (input.confirmPassword !== input.password) {
    errors.confirmPassword = 'Passwords do not match';
  }
  return errors;
}

export function validateForgotPassword(email: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!required(email)) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Enter a valid email';
  }
  return errors;
}

export function validateResetPassword(
  password: string,
  confirmPassword: string,
): FieldErrors {
  const errors: FieldErrors = {};
  if (!required(password) || !isValidPassword(password)) {
    errors.password = 'Password must be at least 8 characters';
  }
  if (confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match';
  }
  return errors;
}

export function validateProfile(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!required(input.firstName)) {
    errors.firstName = 'First name is required';
  }
  if (!required(input.lastName)) {
    errors.lastName = 'Last name is required';
  }
  if (!required(input.email) || !isValidEmail(input.email)) {
    errors.email = 'Valid email is required';
  }
  if (!required(input.phone) || !isValidPhone(input.phone)) {
    errors.phone = 'Valid phone is required';
  }
  return errors;
}
