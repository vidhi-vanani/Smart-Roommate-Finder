import { API_ENDPOINTS } from './apiConfig';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone_number: string;
}

export interface AuthResponse {
  message: string;
  user_id: number;
  email: string;
}

export interface ApiError {
  detail?: string;
  message?: string;
}

/**
 * Register a new user
 * @param data - User registration data
 * @returns Promise with registration response
 */
export async function registerUser(data: RegisterData): Promise<AuthResponse> {
  try {
    const response = await fetch(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.detail || errorData.message || 'Registration failed');
    }

    const result: AuthResponse = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred during registration');
  }
}

/**
 * Login user
 * @param email - User email
 * @param password - User password
 * @returns Promise with login response
 */
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.detail || errorData.message || 'Login failed');
    }

    const result: AuthResponse = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred during login');
  }
}

/**
 * Get user by ID
 * @param id - User ID
 * @returns Promise with user data
 */
export async function getUserById(id: number): Promise<any> {
  try {
    const response = await fetch(API_ENDPOINTS.GET_USER(id));

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.detail || errorData.message || 'Failed to fetch user');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching user data');
  }
}
