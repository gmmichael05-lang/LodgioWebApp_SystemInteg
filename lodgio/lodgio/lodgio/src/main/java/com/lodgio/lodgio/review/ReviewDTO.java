package com.lodgio.lodgio.review;

import java.time.LocalDateTime;
import java.util.UUID;

public record ReviewDTO(
        UUID id,
        Integer rating,
        String comment,
        LocalDateTime createdAt,
        GuestSummary guest
) {
    public record GuestSummary(
            UUID id,
            String fullname,
            String profilePictureUrl
    ) {}

    public static ReviewDTO from(Review review) {
        GuestSummary gs = null;
        if (review.getGuest() != null) {
            gs = new GuestSummary(
                    review.getGuest().getId(),
                    review.getGuest().getFullname(),
                    review.getGuest().getProfilePictureUrl()
            );
        }
        return new ReviewDTO(
                review.getId(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt(),
                gs
        );
    }
}
