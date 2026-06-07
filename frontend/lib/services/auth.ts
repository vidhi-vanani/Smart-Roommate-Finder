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
  gender?: string | null;
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
  gender?: string | null;
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

export interface RoommateRequest {
  id: number;
  sender_id: number;
  receiver_id: number;
  status: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  created_at?: string | null;
}

export interface UnreadMessageCount {
  user_id: number;
  unread_count: number;
}

export interface ApiError {
  detail?: string;
  message?: string;
}

async function getApiErrorMessage(response: Response, fallbackMessage: string): Promise<string> {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const errorData: ApiError = await response.json();
    return errorData.detail || errorData.message || fallbackMessage;
  }

  const errorText = await response.text();
  return errorText || fallbackMessage;
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

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const response = await fetch(API_ENDPOINTS.GET_USERS);
    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.detail || errorData.message || 'Failed to fetch users');
    }
    const result: UserProfile[] = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching users');
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
      throw new Error(await getApiErrorMessage(response, 'Failed to update preferences'));
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

export async function sendRoommateRequest(
  senderId: number,
  receiverId: number
): Promise<RoommateRequest> {
  const url = API_ENDPOINTS.SEND_REQUEST;
  console.debug('sendRoommateRequest', url, { senderId, receiverId });

  try {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sender_id: senderId, receiver_id: receiverId }),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, 'Failed to send request'));
    }

    const result: RoommateRequest = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while sending roommate request');
  }
}

export async function getSentRequests(userId: number): Promise<RoommateRequest[]> {
  const url = API_ENDPOINTS.SENT_REQUESTS(userId);
  console.debug('getSentRequests', url);

  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, 'Failed to load sent requests'));
    }
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      console.error('getSentRequests failed', error);
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while loading sent requests');
  }
}

export async function getReceivedRequests(userId: number): Promise<RoommateRequest[]> {
  const url = API_ENDPOINTS.RECEIVED_REQUESTS(userId);
  console.debug('getReceivedRequests', url);

  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, 'Failed to load received requests'));
    }
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      console.error('getReceivedRequests failed', error);
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while loading received requests');
  }
}

export async function getConnections(userId: number): Promise<RoommateRequest[]> {
  const url = API_ENDPOINTS.CONNECTIONS(userId);
  console.debug('getConnections', url);

  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, 'Failed to load connections'));
    }
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      console.error('getConnections failed', error);
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while loading connections');
  }
}

export async function acceptRoommateRequest(
  requestId: number,
  receiverId: number
): Promise<RoommateRequest> {
  const url = `${API_ENDPOINTS.ACCEPT_REQUEST(requestId)}?receiver_id=${receiverId}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, 'Failed to accept request'));
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while accepting roommate request');
  }
}

export async function rejectRoommateRequest(
  requestId: number,
  receiverId: number
): Promise<RoommateRequest> {
  const url = `${API_ENDPOINTS.REJECT_REQUEST(requestId)}?receiver_id=${receiverId}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, 'Failed to reject request'));
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while rejecting roommate request');
  }
}

export async function getMessages(
  currentUserId: number,
  otherUserId: number
): Promise<Message[]> {
  try {
    const response = await fetch(API_ENDPOINTS.MESSAGES(currentUserId, otherUserId), {
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, 'Failed to load messages'));
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while loading messages');
  }
}

export async function sendMessage(
  senderId: number,
  receiverId: number,
  content: string
): Promise<Message> {
  try {
    const response = await fetch(API_ENDPOINTS.SEND_MESSAGE, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
      }),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, 'Failed to send message'));
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while sending message');
  }
}

export async function getUnreadMessageCounts(userId: number): Promise<UnreadMessageCount[]> {
  try {
    const response = await fetch(API_ENDPOINTS.UNREAD_MESSAGES(userId), {
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, 'Failed to load unread messages'));
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while loading unread messages');
  }
}

export async function markMessagesRead(currentUserId: number, otherUserId: number): Promise<void> {
  try {
    const response = await fetch(API_ENDPOINTS.MARK_MESSAGES_READ(currentUserId, otherUserId), {
      method: 'POST',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, 'Failed to mark messages as read'));
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while marking messages as read');
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
