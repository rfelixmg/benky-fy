interface UserSettings {
  theme?: 'light' | 'dark';
  language?: string;
  notifications?: boolean;
}

export interface APIResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

export interface AuthEndpoints {
  login: `/api/auth/${string}`;
  logout: `/api/auth/${string}`;
  testLogin: `/api/auth/${string}`;
}

export interface UserResponse {
  name: string;
  email?: string;
  picture?: string;
  is_test_user?: boolean;
  settings?: UserSettings;
}

export interface LoginResponse {
  success: boolean;
  redirect_url: string;
  message?: string;
}