const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const getAllUsers = () =>
  fetch(`${API}/users/all`);

export const getAllListings = () =>
  fetch(`${API}/listings/all`);

export const deleteUser = (id) =>
  fetch(`${API}/users/${id}`, { method: "DELETE" });

export const deleteListing = (id) =>
  fetch(`${API}/listings/${id}`, { method: "DELETE" });
