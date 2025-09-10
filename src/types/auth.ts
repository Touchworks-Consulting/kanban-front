export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Account {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  // Adicione outros campos que você espera da API
  // Ex: settings, createdAt, etc.
}

export interface AuthResponse {
  token: string;
  user: Account;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  accountName: string;
  domain: string;
}
