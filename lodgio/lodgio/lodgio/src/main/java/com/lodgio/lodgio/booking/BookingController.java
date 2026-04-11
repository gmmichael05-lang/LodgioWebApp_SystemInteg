package com.lodgio.lodgio.booking;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @GetMapping("/guest/{email}")
    public ResponseEntity<List<BookingDTO>> getBookingsByGuestEmail(@PathVariable("email") String email) {
        return bookingService.getBookingsByGuestEmail(email)
                .map(bookings -> ResponseEntity.ok(
                        bookings.stream().map(BookingDTO::from).toList()))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/host/{email}")
    public ResponseEntity<List<BookingDTO>> getBookingsByHostEmail(@PathVariable("email") String email) {
        return bookingService.getBookingsForHostEmail(email)
                .map(bookings -> ResponseEntity.ok(
                        bookings.stream().map(BookingDTO::from).toList()))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(@RequestBody Booking booking) {
        return bookingService.createBooking(booking)
                .map(b -> ResponseEntity.ok(BookingDTO.from(b)))
                .orElse(ResponseEntity.badRequest().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<BookingDTO> updateBookingStatus(
            @PathVariable("id") UUID id,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        return bookingService.updateBookingStatus(id, status)
                .map(b -> ResponseEntity.ok(BookingDTO.from(b)))
                .orElse(ResponseEntity.notFound().build());
    }
}
