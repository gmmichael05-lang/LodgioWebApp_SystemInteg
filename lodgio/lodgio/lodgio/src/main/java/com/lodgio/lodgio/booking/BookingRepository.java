package com.lodgio.lodgio.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findByGuestId(UUID guestId);
    List<Booking> findByListingHostId(UUID hostId);
    List<Booking> findByListingId(UUID listingId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Booking b WHERE b.listing.id = :listingId")
    void deleteByListingId(UUID listingId);
}
