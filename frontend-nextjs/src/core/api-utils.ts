// API_BASE_URL is set via environment variables in production (GCP Cloud Run)
// No default value - must be set via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchFromBackend(endpoint: string, options?: RequestInit) {
  if (!API_BASE_URL) {
    throw new Error('API_BASE_URL environment variable is not set');
  }
  
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching from backend ${url}:`, error);
    throw error;
  }
}

export { API_BASE_URL };
