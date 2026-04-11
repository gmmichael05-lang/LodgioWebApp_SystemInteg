const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const getUserByEmail = (email) =>
  fetch(`${API}/users/${email}`);

export const registerUser = (userData) =>
  fetch(`${API}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

export const updateProfilePicture = (id, imageUrl) =>
  fetch(`${API}/users/${id}/profile-picture`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(imageUrl),
  });

export const updateUser = (id, userData) =>
  fetch(`${API}/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

export const getAllUsers = () =>
  fetch(`${API}/users/all`);

export const deleteUser = (id) =>
  fetch(`${API}/users/${id}`, { method: "DELETE" });
