package com.lodgio.lodgio.listing;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/listings")
public class ListingController {

    @Autowired
    private ListingService listingService;

    @GetMapping
    public ResponseEntity<List<ListingDTO>> getAllListings(
            @RequestParam(value = "search", required = false) String search) {
        List<Listing> listings;
        if (search != null && !search.isEmpty()) {
            listings = listingService.searchListings(search);
        } else {
            listings = listingService.getActiveListings();
        }
        return ResponseEntity.ok(listings.stream().map(ListingDTO::from).toList());
    }

    @GetMapping("/search")
    public ResponseEntity<List<ListingDTO>> searchAdvancedListings(
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(value = "maxPrice", required = false) BigDecimal maxPrice,
            @RequestParam(value = "guests", required = false) Integer guests,
            @RequestParam(value = "amenities", required = false) String amenities) {
        List<Listing> results = listingService.searchAdvanced(city, type, minPrice, maxPrice, guests, amenities);
        return ResponseEntity.ok(results.stream().map(ListingDTO::from).toList());
    }

    @GetMapping("/all")
    public ResponseEntity<List<ListingDTO>> getAbsolutelyAllListings() {
        return ResponseEntity.ok(
                listingService.getAllListings().stream().map(ListingDTO::from).toList()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListingDTO> getListingById(@PathVariable("id") UUID id) {
        return listingService.getListingById(id)
                .map(l -> ResponseEntity.ok(ListingDTO.from(l)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/host/{email}")
    public ResponseEntity<List<ListingDTO>> getListingsByHostEmail(@PathVariable("email") String email) {
        return listingService.getListingsByHostEmail(email)
                .map(listings -> ResponseEntity.ok(
                        listings.stream().map(ListingDTO::from).toList()))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ListingDTO> createListing(@RequestBody Listing listing) {
        return listingService.createListingWithHost(listing)
                .map(l -> ResponseEntity.ok(ListingDTO.from(l)))
                .orElse(ResponseEntity.badRequest().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ListingDTO> updateListing(
            @PathVariable("id") UUID id,
            @RequestBody Listing listingDetails) {
        return listingService.updateListing(id, listingDetails)
                .map(l -> ResponseEntity.ok(ListingDTO.from(l)))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteListing(@PathVariable("id") UUID id) {
        if (listingService.getListingById(id).isPresent()) {
            listingService.deleteListing(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/toggle-active")
    public ResponseEntity<ListingDTO> toggleActive(@PathVariable("id") UUID id) {
        return listingService.toggleActive(id)
                .map(l -> ResponseEntity.ok(ListingDTO.from(l)))
                .orElse(ResponseEntity.notFound().build());
    }
}
