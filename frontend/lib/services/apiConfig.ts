// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const API_ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/users/`,
  LOGIN: `${API_BASE_URL}/login/`,
  GET_USER: (id: number) => `${API_BASE_URL}/user/${id}`,
  GET_USERS: `${API_BASE_URL}/users`,
  UPDATE_PREFERENCES: (id: number) => `${API_BASE_URL}/user/${id}/preferences`,
  UPLOAD_PHOTO: (id: number) => `${API_BASE_URL}/user/${id}/photo`,
  // Add more endpoints as needed
};

export default API_BASE_URL;
