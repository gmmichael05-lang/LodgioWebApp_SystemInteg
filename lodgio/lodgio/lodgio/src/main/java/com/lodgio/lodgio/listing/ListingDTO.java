package com.lodgio.lodgio.listing;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record ListingDTO(
        UUID id,
        String title,
        String description,
        BigDecimal pricePerNight,
        Integer guestCapacity,
        String amenities,
        String imageUrls,
        String status,
        Boolean isActive,
        Double averageRating,
        Integer reviewCount,
        String type,
        Integer beds,
        Integer baths,
        String city,
        String location,
        LocalDateTime createdAt,
        HostSummary host
) {
    public record HostSummary(
            UUID id,
            String fullname,
            String email,
            String profilePictureUrl
    ) {}

    public static ListingDTO from(Listing listing) {
        HostSummary hostSummary = null;
        if (listing.getHost() != null) {
            hostSummary = new HostSummary(
                    listing.getHost().getId(),
                    listing.getHost().getFullname(),
                    listing.getHost().getEmail(),
                    listing.getHost().getProfilePictureUrl()
            );
        }
        return new ListingDTO(
                listing.getId(),
                listing.getTitle(),
                listing.getDescription(),
                listing.getPricePerNight(),
                listing.getGuestCapacity(),
                listing.getAmenities(),
                listing.getImageUrls(),
                listing.getStatus(),
                listing.getIsActive(),
                listing.getAverageRating(),
                listing.getReviewCount(),
                listing.getType(),
                listing.getBeds(),
                listing.getBaths(),
                listing.getCity(),
                listing.getLocation(),
                listing.getCreatedAt(),
                hostSummary
        );
    }
}
