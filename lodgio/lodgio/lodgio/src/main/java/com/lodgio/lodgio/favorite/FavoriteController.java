package com.lodgio.lodgio.favorite;

import com.lodgio.lodgio.listing.ListingDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    /**
     * Get all favorited listings for a user by email.
     */
    @GetMapping("/{email}")
    public ResponseEntity<List<ListingDTO>> getFavorites(@PathVariable("email") String email) {
        List<ListingDTO> listings = favoriteService.getFavoritesByUserEmail(email)
                .stream()
                .map(fav -> ListingDTO.from(fav.getListing()))
                .toList();
        return ResponseEntity.ok(listings);
    }

    /**
     * Check if a listing is favorited by a user.
     */
    @GetMapping("/{email}/{listingId}")
    public ResponseEntity<Map<String, Boolean>> isFavorited(
            @PathVariable("email") String email,
            @PathVariable("listingId") UUID listingId) {
        boolean favorited = favoriteService.isFavorited(email, listingId);
        return ResponseEntity.ok(Map.of("favorited", favorited));
    }

    /**
     * Add a listing to favorites.
     */
    @PostMapping("/{email}/{listingId}")
    public ResponseEntity<Void> addFavorite(
            @PathVariable("email") String email,
            @PathVariable("listingId") UUID listingId) {
        favoriteService.addFavorite(email, listingId);
        return ResponseEntity.ok().build();
    }

    /**
     * Remove a listing from favorites.
     */
    @DeleteMapping("/{email}/{listingId}")
    public ResponseEntity<Void> removeFavorite(
            @PathVariable("email") String email,
            @PathVariable("listingId") UUID listingId) {
        favoriteService.removeFavorite(email, listingId);
        return ResponseEntity.ok().build();
    }
}
