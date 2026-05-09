package com.lodgio.lodgio.review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByListingIdOrderByCreatedAtDesc(UUID listingId);
    boolean existsByBookingId(UUID bookingId);
    
    @Query("SELECT r.bookingId FROM Review r WHERE r.guest.id = :guestId")
    List<UUID> findBookingIdsByGuestId(@Param("guestId") UUID guestId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.listing.id = :listingId")
    Double getAverageRatingByListingId(@Param("listingId") UUID listingId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.listing.id = :listingId")
    Long getReviewCountByListingId(@Param("listingId") UUID listingId);
}
