const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const getActiveListings = () =>
  fetch(`${API}/listings`);

export const searchListings = (query) =>
  fetch(`${API}/listings?search=${encodeURIComponent(query)}`);

export const searchAdvancedListings = (params) => {
  const p = new URLSearchParams();
  if (params.city && params.city !== "Anywhere") p.append("city", params.city);
  if (params.type && params.type !== "Any type") p.append("type", params.type);
  if (params.maxPrice) p.append("maxPrice", params.maxPrice);
  if (params.guests > 1) p.append("guests", params.guests);
  if (params.amenities && params.amenities.length > 0) p.append("amenities", params.amenities.join(","));
  return fetch(`${API}/listings/search?${p.toString()}`);
};

export const getAllListings = () =>
  fetch(`${API}/listings/all`);

export const getListingById = (id) =>
  fetch(`${API}/listings/${id}`);

export const getListingsByHostEmail = (email) =>
  fetch(`${API}/listings/host/${email}`);

export const createListing = (payload) =>
  fetch(`${API}/listings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const updateListing = (id, payload) =>
  fetch(`${API}/listings/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const deleteListing = (id) =>
  fetch(`${API}/listings/${id}`, { method: "DELETE" });
