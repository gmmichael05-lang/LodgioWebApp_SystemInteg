package com.lodgio.lodgio.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findByGuestId(UUID guestId);
    List<Booking> findByListingHostId(UUID hostId);
    List<Booking> findByListingId(UUID listingId);

    @Query("SELECT b FROM Booking b WHERE b.listing.id = :listingId AND b.status <> 'REJECTED' AND b.checkInDate < :checkOut AND b.checkOutDate > :checkIn")
    List<Booking> findOverlappingBookings(@Param("listingId") UUID listingId, @Param("checkIn") LocalDate checkIn, @Param("checkOut") LocalDate checkOut);

    @Query("SELECT b FROM Booking b WHERE b.listing.id = :listingId AND b.status <> 'REJECTED'")
    List<Booking> findActiveBookingsByListingId(@Param("listingId") UUID listingId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Booking b WHERE b.listing.id = :listingId")
    void deleteByListingId(UUID listingId);
}
