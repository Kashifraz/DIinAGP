export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignUpData {
  username: string;
  email?: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  username: string;
  email?: string;
}

