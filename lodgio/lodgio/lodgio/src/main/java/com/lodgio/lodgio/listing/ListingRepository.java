package com.lodgio.lodgio.listing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ListingRepository extends JpaRepository<Listing, UUID> {
    List<Listing> findByHostId(UUID hostId);
    List<Listing> findByStatus(String status);
    List<Listing> findByTitleContainingIgnoreCaseOrCityContainingIgnoreCase(String title, String city);
}
