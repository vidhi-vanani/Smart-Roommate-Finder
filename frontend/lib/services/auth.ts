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

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  age?: number | null;
  occupation?: string | null;
  city?: string | null;
  phone_number?: string | null;
  diet?: string | null;
  allergies?: string[] | null;
  description?: string | null;
  street_address?: string | null;
  zip_code?: number | null;
  state?: string | null;
  country?: string | null;
  min_budget?: number | null;
  max_budget?: number | null;
  quiet_hours_from?: number | null;
  quiet_hours_to?: number | null;
  cleanliness?: string | null;
  social_interaction?: string | null;
  interests?: string | null;
  smoking_preference?: boolean | null;
  profile_photo?: string | null;
  is_active: boolean;
}

export interface PreferenceUpdateData {
  age?: number | null;
  occupation?: string | null;
  city?: string | null;
  phone_number?: string | null;
  diet?: string | null;
  allergies?: string[] | null;
  description?: string | null;
  street_address?: string | null;
  zip_code?: number | null;
  state?: string | null;
  country?: string | null;
  min_budget?: number | null;
  max_budget?: number | null;
  quiet_hours_from?: number | null;
  quiet_hours_to?: number | null;
  cleanliness?: string | null;
  social_interaction?: string | null;
  interests?: string | null;
  smoking_preference?: boolean | null;
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
export async function getUserById(id: number): Promise<UserProfile> {
  try {
    const response = await fetch(API_ENDPOINTS.GET_USER(id));

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.detail || errorData.message || 'Failed to fetch user');
    }

    const result: UserProfile = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching user data');
  }
}

/**
 * Update user preferences and profile details
 * @param id - User ID
 * @param data - Preference data
 * @returns Promise with updated user data
 */
export async function updateUserPreferences(
  id: number,
  data: PreferenceUpdateData
): Promise<UserProfile> {
  try {
    const response = await fetch(API_ENDPOINTS.UPDATE_PREFERENCES(id), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.detail || errorData.message || 'Failed to update preferences');
    }

    const result: UserProfile = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while updating preferences');
  }
}

/**
 * Upload user profile photo
 * @param id - User ID
 * @param file - Image file
 */
export async function uploadUserPhoto(id: number, file: File): Promise<UserProfile> {
  try {
    const form = new FormData();
    form.append('file', file);

    const response = await fetch(API_ENDPOINTS.UPLOAD_PHOTO(id), {
      method: 'POST',
      body: form,
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.detail || errorData.message || 'Failed to upload photo');
    }

    const result: UserProfile = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while uploading photo');
  }
}
