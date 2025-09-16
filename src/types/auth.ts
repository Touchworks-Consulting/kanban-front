export interface UserAccount {
  id: string;            // mantido para compat (usa id da conta)
  account_id?: string;   // id da conta real
  user_id?: string;      // id do usuário
  name: string;
  email: string;
  role?: 'owner' | 'admin' | 'member';
}

export interface AuthResponse {
  token: string;
  user: UserAccount;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  accountName?: string;
  domain?: string;
}
