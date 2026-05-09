package com.lodgio.lodgio.review;

import com.lodgio.lodgio.listing.Listing;
import com.lodgio.lodgio.listing.ListingRepository;
import com.lodgio.lodgio.user.User;
import com.lodgio.lodgio.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ListingRepository listingRepository;

    public List<Review> getReviewsByListingId(UUID listingId) {
        return reviewRepository.findByListingIdOrderByCreatedAtDesc(listingId);
    }

    public Double getAverageRating(UUID listingId) {
        Double avg = reviewRepository.getAverageRatingByListingId(listingId);
        return avg != null ? Math.round(avg * 10.0) / 10.0 : null;
    }

    public Long getReviewCount(UUID listingId) {
        return reviewRepository.getReviewCountByListingId(listingId);
    }

    public boolean hasReviewed(UUID bookingId) {
        return reviewRepository.existsByBookingId(bookingId);
    }
    
    public List<UUID> getReviewedBookingIds(String email) {
        return userRepository.findByEmail(email)
                .map(u -> reviewRepository.findBookingIdsByGuestId(u.getId()))
                .orElse(List.of());
    }

    public Optional<Review> createReview(String email, UUID listingId, UUID bookingId, Integer rating, String comment) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        Optional<Listing> listingOpt = listingRepository.findById(listingId);

        if (userOpt.isPresent() && listingOpt.isPresent()) {
            // Prevent duplicate reviews for the same booking
            if (reviewRepository.existsByBookingId(bookingId)) {
                return Optional.empty();
            }
            Review review = new Review();
            review.setGuest(userOpt.get());
            review.setListing(listingOpt.get());
            review.setBookingId(bookingId);
            review.setRating(Math.max(1, Math.min(5, rating)));
            review.setComment(comment);
            
            review = reviewRepository.save(review);
            
            // Update listing stats
            Listing listing = listingOpt.get();
            Double newAvg = reviewRepository.getAverageRatingByListingId(listingId);
            Long newCount = reviewRepository.getReviewCountByListingId(listingId);
            listing.setAverageRating(newAvg != null ? Math.round(newAvg * 10.0) / 10.0 : 0.0);
            listing.setReviewCount(newCount != null ? newCount.intValue() : 0);
            listingRepository.save(listing);
            
            return Optional.of(review);
        }
        return Optional.empty();
    }
}
