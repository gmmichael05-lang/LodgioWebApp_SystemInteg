const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const getBookingsByGuestEmail = (email) =>
  fetch(`${API}/bookings/guest/${email}`);

export const getBookingsByHostEmail = (email) =>
  fetch(`${API}/bookings/host/${email}`);

export const createBooking = (payload) =>
  fetch(`${API}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const updateBookingStatus = (id, status) =>
  fetch(`${API}/bookings/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
