package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.RejectedBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.Optional;

/**
 * Spring Data JPA repository for the RejectedBooking entity.
 */
@Repository
public interface RejectedBookingRepository extends JpaRepository<RejectedBooking, Long> {

    @Query("SELECT rb FROM RejectedBooking rb " +
           "WHERE rb.userId = :userId " +
           "AND rb.serviceId = :serviceId " +
           "AND rb.startTime = :startTime " +
           "AND rb.endTime = :endTime " +
           "ORDER BY rb.rejectionTime DESC")
    Optional<RejectedBooking> findMostRecentRejection(
        @Param("userId") Long userId,
        @Param("serviceId") Long serviceId,
        @Param("startTime") Instant startTime,
        @Param("endTime") Instant endTime
    );
} 