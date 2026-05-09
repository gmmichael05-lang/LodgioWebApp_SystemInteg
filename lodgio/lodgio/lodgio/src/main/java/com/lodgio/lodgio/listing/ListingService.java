package com.lodgio.lodgio.listing;

import com.lodgio.lodgio.booking.BookingRepository;
import com.lodgio.lodgio.user.User;
import com.lodgio.lodgio.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ListingService {

    @Autowired
    private ListingRepository listingRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserService userService;

    // ─── Basic queries ───

    public List<Listing> getAllListings() {
        return listingRepository.findAll();
    }

    public List<Listing> getActiveListings() {
        return listingRepository.findByStatus("ACTIVE").stream()
                .filter(l -> l.getIsActive() == null || l.getIsActive())
                .collect(Collectors.toList());
    }

    public List<Listing> searchListings(String query) {
        return listingRepository.findByTitleContainingIgnoreCaseOrCityContainingIgnoreCase(query, query)
                .stream()
                .filter(l -> l.getIsActive() == null || l.getIsActive())
                .collect(Collectors.toList());
    }

    public Optional<Listing> getListingById(UUID id) {
        return listingRepository.findById(id);
    }

    public List<Listing> getListingsByHost(UUID hostId) {
        return listingRepository.findByHostId(hostId);
    }

    // ─── Cross-slice: resolve host by email (moved from controller) ───

    public Optional<List<Listing>> getListingsByHostEmail(String email) {
        return userService.getUserByEmail(email)
                .map(user -> listingRepository.findByHostId(user.getId()));
    }

    // ─── Advanced search ───

    public List<Listing> searchAdvanced(String city, String type, BigDecimal minPrice,
                                         BigDecimal maxPrice, Integer guests, String amenities) {
        return getActiveListings().stream()
                .filter(l -> city == null || city.isEmpty() || "Anywhere".equalsIgnoreCase(city)
                        || (l.getCity() != null && l.getCity().toLowerCase().contains(city.toLowerCase())))
                .filter(l -> type == null || type.isEmpty() || "Any type".equalsIgnoreCase(type)
                        || (l.getType() != null && l.getType().equalsIgnoreCase(type)))
                .filter(l -> minPrice == null
                        || (l.getPricePerNight() != null && l.getPricePerNight().compareTo(minPrice) >= 0))
                .filter(l -> maxPrice == null
                        || (l.getPricePerNight() != null && l.getPricePerNight().compareTo(maxPrice) <= 0))
                .filter(l -> guests == null
                        || (l.getGuestCapacity() != null && l.getGuestCapacity() >= guests))
                .filter(l -> {
                    if (amenities == null || amenities.isEmpty()) return true;
                    if (l.getAmenities() == null) return false;
                    String[] required = amenities.toLowerCase().split(",");
                    String listingAmens = l.getAmenities().toLowerCase();
                    for (String req : required) {
                        if (!listingAmens.contains(req.trim())) return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    // ─── Create with host resolution (cross-slice, moved from controller) ───

    public Optional<Listing> createListingWithHost(Listing listing) {
        if (listing.getHost() != null && listing.getHost().getId() != null) {
            Optional<User> host = userService.getUserById(listing.getHost().getId());
            if (host.isPresent()) {
                listing.setHost(host.get());
                return Optional.of(listingRepository.save(listing));
            }
        }
        return Optional.empty();
    }

    // ─── Update ───

    public Optional<Listing> updateListing(UUID id, Listing details) {
        return listingRepository.findById(id).map(listing -> {
            listing.setTitle(details.getTitle());
            listing.setDescription(details.getDescription());
            listing.setPricePerNight(details.getPricePerNight());
            listing.setGuestCapacity(details.getGuestCapacity());
            listing.setAmenities(details.getAmenities());
            listing.setImageUrls(details.getImageUrls());
            listing.setCity(details.getCity());
            listing.setLocation(details.getLocation());
            listing.setType(details.getType());
            listing.setBeds(details.getBeds());
            listing.setBaths(details.getBaths());
            listing.setStatus(details.getStatus());
            return listingRepository.save(listing);
        });
    }

    public Listing saveListing(Listing listing) {
        return listingRepository.save(listing);
    }

    /**
     * Delete a listing and ALL its associated bookings first to avoid FK constraint violations.
     */
    @Transactional
    public void deleteListing(UUID id) {
        bookingRepository.deleteByListingId(id);
        listingRepository.deleteById(id);
    }

    /**
     * Toggle the isActive flag on a listing (pause / unpublish).
     */
    public Optional<Listing> toggleActive(UUID id) {
        return listingRepository.findById(id).map(listing -> {
            listing.setIsActive(listing.getIsActive() == null || !listing.getIsActive());
            return listingRepository.save(listing);
        });
    }
}
