package com.lodgio.lodgio.booking;

import com.lodgio.lodgio.listing.Listing;
import com.lodgio.lodgio.listing.ListingService;
import com.lodgio.lodgio.user.User;
import com.lodgio.lodgio.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private ListingService listingService;

    // ─── Basic queries ───

    public List<Booking> getBookingsByGuest(UUID guestId) {
        return bookingRepository.findByGuestId(guestId);
    }

    public List<Booking> getBookingsForHost(UUID hostId) {
        return bookingRepository.findByListingHostId(hostId);
    }

    public List<Booking> getBookingsForListing(UUID listingId) {
        return bookingRepository.findByListingId(listingId);
    }

    public Optional<Booking> getBookingById(UUID id) {
        return bookingRepository.findById(id);
    }

    // ─── Cross-slice: resolve by email (moved from controller) ───

    public Optional<List<Booking>> getBookingsByGuestEmail(String email) {
        return userService.getUserByEmail(email)
                .map(user -> bookingRepository.findByGuestId(user.getId()));
    }

    public Optional<List<Booking>> getBookingsForHostEmail(String email) {
        return userService.getUserByEmail(email)
                .map(user -> bookingRepository.findByListingHostId(user.getId()));
    }

    // ─── Create with entity resolution (cross-slice, moved from controller) ───

    public Optional<Booking> createBooking(Booking booking) {
        if (booking.getGuest() != null && booking.getGuest().getId() != null &&
                booking.getListing() != null && booking.getListing().getId() != null) {

            Optional<User> guest = userService.getUserById(booking.getGuest().getId());
            Optional<Listing> listing = listingService.getListingById(booking.getListing().getId());

            if (guest.isPresent() && listing.isPresent()) {
                // Calendar blocking: reject if dates overlap with existing bookings
                if (hasDateConflict(booking.getListing().getId(),
                        booking.getCheckInDate(), booking.getCheckOutDate())) {
                    return Optional.empty();
                }
                booking.setGuest(guest.get());
                booking.setListing(listing.get());
                return Optional.of(bookingRepository.save(booking));
            }
        }
        return Optional.empty();
    }

    // ─── Calendar blocking helpers ───

    public boolean hasDateConflict(UUID listingId, LocalDate checkIn, LocalDate checkOut) {
        return !bookingRepository.findOverlappingBookings(listingId, checkIn, checkOut).isEmpty();
    }

    public List<Booking> getActiveBookingsForListing(UUID listingId) {
        return bookingRepository.findActiveBookingsByListingId(listingId);
    }

    // ─── Update status ───

    public Optional<Booking> updateBookingStatus(UUID id, String status) {
        return bookingRepository.findById(id).map(booking -> {
            booking.setStatus(status);
            return bookingRepository.save(booking);
        });
    }

    public Booking saveBooking(Booking booking) {
        return bookingRepository.save(booking);
    }

    public void deleteBooking(UUID id) {
        bookingRepository.deleteById(id);
    }
}
