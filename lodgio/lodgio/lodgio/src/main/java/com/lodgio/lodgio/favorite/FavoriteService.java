package com.lodgio.lodgio.favorite;

import com.lodgio.lodgio.listing.Listing;
import com.lodgio.lodgio.listing.ListingRepository;
import com.lodgio.lodgio.user.User;
import com.lodgio.lodgio.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ListingRepository listingRepository;

    public List<Favorite> getFavoritesByUserEmail(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        return user.map(u -> favoriteRepository.findByUserId(u.getId()))
                .orElse(List.of());
    }

    public boolean isFavorited(String email, UUID listingId) {
        Optional<User> user = userRepository.findByEmail(email);
        return user.map(u -> favoriteRepository.existsByUserIdAndListingId(u.getId(), listingId))
                .orElse(false);
    }

    public Optional<Favorite> addFavorite(String email, UUID listingId) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        Optional<Listing> listingOpt = listingRepository.findById(listingId);

        if (userOpt.isPresent() && listingOpt.isPresent()) {
            // Check if already favorited
            if (favoriteRepository.existsByUserIdAndListingId(userOpt.get().getId(), listingId)) {
                return favoriteRepository.findByUserIdAndListingId(userOpt.get().getId(), listingId);
            }
            Favorite fav = new Favorite();
            fav.setUser(userOpt.get());
            fav.setListing(listingOpt.get());
            return Optional.of(favoriteRepository.save(fav));
        }
        return Optional.empty();
    }

    @Transactional
    public boolean removeFavorite(String email, UUID listingId) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            favoriteRepository.deleteByUserIdAndListingId(userOpt.get().getId(), listingId);
            return true;
        }
        return false;
    }
}
