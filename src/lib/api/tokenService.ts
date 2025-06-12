import axios from 'axios';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  issued: string;
  expires: string;
}

// Default token endpoint
const DEFAULT_TOKEN_URL = 'https://apitests.primeroedge.co/GCAPIs/Token';

/**
 * Check if token exists and is valid
 */
export const hasValidToken = (): boolean => {
  const token = getCurrentToken();
  if (!token) return false;
  
  return !isTokenExpired(token);
};

/**
 * Generate a new token using username and password
 */
export const generateToken = async (
  username: string, 
  password: string, 
  tokenUrl: string = DEFAULT_TOKEN_URL
): Promise<TokenResponse> => {
  try {
    const formData = new FormData();
    formData.append('UserName', username);
    formData.append('Password', password);

    const response = await axios.post<TokenResponse>(
      tokenUrl,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.data || !response.data.access_token) {
      throw new Error('Invalid response format');
    }

    // Store token in localStorage
    localStorage.setItem('foodDatabaseToken', response.data.access_token);
    
    // Store token generation timestamp
    localStorage.setItem('tokenGeneratedAt', new Date().toISOString());
    
    return response.data;
  } catch (error) {
    console.error('Error generating token:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Authentication failed: ${error.response.status} ${error.response.statusText}`);
    }
    throw new Error('Failed to generate token');
  }
};

/**
 * Get the current token from localStorage
 */
export const getCurrentToken = (): string | null => {
  return localStorage.getItem('foodDatabaseToken');
};

/**
 * Save token to localStorage
 */
export const saveToken = (token: string): void => {
  localStorage.setItem('foodDatabaseToken', token);
};

/**
 * Parse JWT token to get expiration date.
 * Returns null if token is invalid or malformed.
 */
export const getTokenExpiration = (token: string): Date | null => {
  try {
    // Validate token format (should be 3 parts separated by dots)
    if (!token || typeof token !== 'string' || !token.match(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/)) {
      return null;
    }
    
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decodedPayload = JSON.parse(window.atob(payload));
    if (decodedPayload.exp) {
      return new Date(decodedPayload.exp * 1000);
    }
    return null;
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  return expiration < new Date();
};

/**
 * Get token generation date
 */
export const getTokenGenerationDate = (): Date | null => {
  const timestamp = localStorage.getItem('tokenGeneratedAt');
  if (!timestamp) return null;
  
  try {
    return new Date(timestamp);
  } catch (error) {
    console.error('Error parsing token generation date:', error);
    return null;
  }
};

/**
 * Get token age in days
 */
export const getTokenAge = (): number | null => {
  const generationDate = getTokenGenerationDate();
  if (!generationDate) return null;
  
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - generationDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};