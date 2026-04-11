package com.lodgio.lodgio.booking;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record BookingDTO(
        UUID id,
        LocalDate checkInDate,
        LocalDate checkOutDate,
        BigDecimal totalPrice,
        String status,
        String messageToHost,
        String paymentMethod,
        LocalDateTime createdAt,
        GuestSummary guest,
        ListingSummary listing
) {
    public record GuestSummary(
            UUID id,
            String fullname,
            String email
    ) {}

    public record ListingSummary(
            UUID id,
            String title,
            String city,
            String type,
            Integer guestCapacity,
            BigDecimal pricePerNight,
            String imageUrls
    ) {}

    public static BookingDTO from(Booking booking) {
        GuestSummary guestSummary = null;
        if (booking.getGuest() != null) {
            guestSummary = new GuestSummary(
                    booking.getGuest().getId(),
                    booking.getGuest().getFullname(),
                    booking.getGuest().getEmail()
            );
        }
        ListingSummary listingSummary = null;
        if (booking.getListing() != null) {
            listingSummary = new ListingSummary(
                    booking.getListing().getId(),
                    booking.getListing().getTitle(),
                    booking.getListing().getCity(),
                    booking.getListing().getType(),
                    booking.getListing().getGuestCapacity(),
                    booking.getListing().getPricePerNight(),
                    booking.getListing().getImageUrls()
            );
        }
        return new BookingDTO(
                booking.getId(),
                booking.getCheckInDate(),
                booking.getCheckOutDate(),
                booking.getTotalPrice(),
                booking.getStatus(),
                booking.getMessageToHost(),
                booking.getPaymentMethod(),
                booking.getCreatedAt(),
                guestSummary,
                listingSummary
        );
    }
}
