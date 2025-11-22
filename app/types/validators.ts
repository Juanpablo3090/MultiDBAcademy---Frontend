import { FormErrors } from './index';

export const validateEmail = (email: string): string | null => {
  if (!email) return 'El email es requerido';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'El formato del email no es válido';
  if (email.length > 254) return 'El email es demasiado largo';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'La contraseña es requerida';
  if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
  if (password.length > 100) return 'La contraseña es demasiado larga';
  if (!/[a-zA-Z]/.test(password)) return 'La contraseña debe contener al menos una letra';
  if (!/[0-9]/.test(password)) return 'La contraseña debe contener al menos un número';
  return null;
};

export const validateName = (name: string): string | null => {
  if (!name) return 'El nombre es requerido';
  if (name.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
  if (name.length > 100) return 'El nombre es demasiado largo';
  return null;
};

export const validateInstanceName = (name: string): string | null => {
  if (!name) return 'El nombre de la instancia es requerido';
  if (name.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres';
  if (name.length > 50) return 'El nombre es demasiado largo';
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) return 'Solo letras, números, guiones y guiones bajos';
  return null;
};

export const validateServer = (server: string): string | null => {
  if (!server) return 'El servidor es requerido';
  if (server.trim().length < 1) return 'El servidor no puede estar vacío';
  return null;
};

export const validatePort = (port: number | string): string | null => {
  const portNum = typeof port === 'string' ? parseInt(port, 10) : port;
  if (isNaN(portNum)) return 'El puerto debe ser un número';
  if (portNum < 1 || portNum > 65535) return 'El puerto debe estar entre 1 y 65535';
  return null;
};

export const validateDatabaseName = (dbName: string): string | null => {
  if (!dbName) return 'El nombre de la base de datos es requerido';
  if (dbName.trim().length < 1) return 'El nombre no puede estar vacío';
  if (dbName.length > 64) return 'El nombre es demasiado largo';
  if (!/^[a-zA-Z0-9_]+$/.test(dbName)) return 'Solo letras, números y guiones bajos';
  return null;
};

export const validateUsername = (username: string): string | null => {
  if (!username) return 'El nombre de usuario es requerido';
  if (username.trim().length < 1) return 'El usuario no puede estar vacío';
  if (username.length > 32) return 'El usuario es demasiado largo';
  return null;
};

export const validateSQLQuery = (query: string): string | null => {
  if (!query) return 'La consulta SQL es requerida';
  if (query.trim().length < 5) return 'La consulta es demasiado corta';
  if (query.length > 10000) return 'La consulta es demasiado larga';
  return null;
};

export const validateForm = (
  fields: Record<string, string | number>,
  validators: Record<string, (value: string | number) => string | null>
): FormErrors => {
  const errors: FormErrors = {};
  Object.keys(validators).forEach((field) => {
    const error = validators[field](fields[field]);
    if (error) errors[field] = error;
  });
  return errors;
};