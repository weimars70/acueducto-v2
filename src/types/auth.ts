export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  username: string;
  codigo_empresa: number;
}