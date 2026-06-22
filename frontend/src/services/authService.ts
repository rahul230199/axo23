const API_URL = '/api';

export interface User {
  id: string;
  email: string;
  username?: string;
  name: string;
  role: 'buyer' | 'supplier' | 'admin';
  companyName?: string;
  phone?: string;
  address?: string;
}

export interface RegisterData {
  email: string;
  name: string;
  role: 'buyer' | 'supplier';
  companyName?: string;
  phone?: string;
  address?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  needsReset?: boolean;
}

const setToken = (token: string) => {
  localStorage.setItem('token', token);
};

const getToken = (): string | null => {
  return localStorage.getItem('token');
};

const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Registration failed');
    }

    return result;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Login failed');
    }

    if (result.token) {
      setToken(result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
    }

    return result;
  },

  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to reset password');
    }

    return result;
  },

  logout(): void {
    removeToken();
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return getToken();
  },

  isAuthenticated(): boolean {
    return !!getToken();
  },
};