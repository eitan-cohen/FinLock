
// Determine the base URL for all API requests.
// `NEXT_PUBLIC_API_URL` is injected by Next.js at build time. If it is
// not provided, default to the local backend.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: string;
}

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description?: string;
  status: string;
  createdAt: string;
}

export interface CardStatus {
  status: 'frozen' | 'authorized';
  expiresAt?: string;
  authorizedAmount?: number;
  authorizedCategory?: string;
}

export interface CardDetails {
  id: string;
  status: string;
  maskedNumber: string | null;
  expiryMonth: number;
  expiryYear: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthorizeRequest {
  amount: number;
  category: string;
  duration: number; // in minutes
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('finlock_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('finlock_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('finlock_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Auth endpoints
  async register(email: string, password: string, firstName: string, lastName: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
  }

  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Card endpoints
  async getCardStatus(): Promise<ApiResponse<CardStatus>> {
    return this.request('/api/card/status');
  }

  async getCardDetails(): Promise<ApiResponse<CardDetails>> {
    return this.request('/api/card/details');
  }

  async authorizeTransaction(data: AuthorizeRequest): Promise<ApiResponse<{ success: boolean; expiresAt: string }>> {
    return this.request('/api/card/authorize', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Budget endpoints
  async getBudgets(): Promise<ApiResponse<Budget[]>> {
    return this.request('/api/budgets');
  }

  // Transaction endpoints
  async getTransactions(): Promise<ApiResponse<Transaction[]>> {
    return this.request('/api/transactions');
  }
}

export const apiClient = new ApiClient();
