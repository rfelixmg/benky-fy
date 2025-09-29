export interface User {
  name: string;
  email: string;
  picture?: string;
  is_test_user?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  redirect_url?: string;
}
