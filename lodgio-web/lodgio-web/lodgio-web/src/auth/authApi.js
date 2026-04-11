const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Auth-related API calls (login is via Supabase, but backend user lookup is here)
export const loginGetUser = (email) =>
  fetch(`${API}/users/${email}`);

export const registerUserBackend = (userData) =>
  fetch(`${API}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
