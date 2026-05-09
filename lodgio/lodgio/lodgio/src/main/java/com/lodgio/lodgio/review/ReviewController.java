package com.lodgio.lodgio.review;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    /**
     * Get all reviews for a listing.
     */
    @GetMapping("/listing/{listingId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsForListing(@PathVariable("listingId") UUID listingId) {
        List<ReviewDTO> reviews = reviewService.getReviewsByListingId(listingId)
                .stream().map(ReviewDTO::from).toList();
        return ResponseEntity.ok(reviews);
    }

    /**
     * Get average rating and count for a listing.
     */
    @GetMapping("/listing/{listingId}/summary")
    public ResponseEntity<Map<String, Object>> getReviewSummary(@PathVariable("listingId") UUID listingId) {
        Double avg = reviewService.getAverageRating(listingId);
        Long count = reviewService.getReviewCount(listingId);
        return ResponseEntity.ok(Map.of(
                "averageRating", avg != null ? avg : 0,
                "reviewCount", count != null ? count : 0
        ));
    }

    /**
     * Check if a booking has been reviewed.
     */
    @GetMapping("/check/{bookingId}")
    public ResponseEntity<Map<String, Boolean>> hasReviewed(
            @PathVariable("bookingId") UUID bookingId) {
        return ResponseEntity.ok(Map.of("reviewed", reviewService.hasReviewed(bookingId)));
    }
    
    /**
     * Get all booking IDs reviewed by a user.
     */
    @GetMapping("/guest/{email}/reviewed-bookings")
    public ResponseEntity<List<UUID>> getReviewedBookings(@PathVariable("email") String email) {
        return ResponseEntity.ok(reviewService.getReviewedBookingIds(email));
    }

    /**
     * Create a new review.
     */
    @PostMapping
    public ResponseEntity<ReviewDTO> createReview(@RequestBody Map<String, Object> payload) {
        String email = (String) payload.get("email");
        String listingIdStr = (String) payload.get("listingId");
        String bookingIdStr = (String) payload.get("bookingId");
        
        if (email == null || listingIdStr == null || bookingIdStr == null) {
            return ResponseEntity.badRequest().build();
        }
        
        UUID listingId = UUID.fromString(listingIdStr);
        UUID bookingId = UUID.fromString(bookingIdStr);
        Integer rating = (Integer) payload.get("rating");
        String comment = (String) payload.get("comment");

        return reviewService.createReview(email, listingId, bookingId, rating, comment)
                .map(r -> ResponseEntity.ok(ReviewDTO.from(r)))
                .orElse(ResponseEntity.badRequest().build());
    }
}
