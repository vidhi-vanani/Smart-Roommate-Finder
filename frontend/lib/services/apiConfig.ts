// API Configuration
const API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? '/api'
    : process.env.NEXT_PUBLIC_API_URL?.trim() || '/api';

export const API_ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/users`,
  LOGIN: `${API_BASE_URL}/login/`,
  GET_USER: (id: number) => `${API_BASE_URL}/user/${id}`,
  GET_USERS: `${API_BASE_URL}/users`,
  UPDATE_PREFERENCES: (id: number) => `${API_BASE_URL}/user/${id}/preferences`,
  UPLOAD_PHOTO: (id: number) => `${API_BASE_URL}/user/${id}/photo`,
  SEND_REQUEST: `${API_BASE_URL}/requests/`,
  SENT_REQUESTS: (id: number) => `${API_BASE_URL}/requests/sent/${id}`,
  RECEIVED_REQUESTS: (id: number) => `${API_BASE_URL}/requests/received/${id}`,
  CONNECTIONS: (id: number) => `${API_BASE_URL}/requests/connections/${id}`,
  ACCEPT_REQUEST: (requestId: number) => `${API_BASE_URL}/requests/${requestId}/accept`,
  REJECT_REQUEST: (requestId: number) => `${API_BASE_URL}/requests/${requestId}/reject`,
  // Add more endpoints as needed
};

export default API_BASE_URL;
