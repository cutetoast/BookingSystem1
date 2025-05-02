package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Appointment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Appointment entity.
 */
@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    @Query("select appointment from Appointment appointment where appointment.user.login = ?#{authentication.name}")
    List<Appointment> findByUserIsCurrentUser();

    default Optional<Appointment> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<Appointment> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<Appointment> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select appointment from Appointment appointment left join fetch appointment.user left join fetch appointment.service",
        countQuery = "select count(appointment) from Appointment appointment"
    )
    Page<Appointment> findAllWithToOneRelationships(Pageable pageable);

    @Query("select appointment from Appointment appointment left join fetch appointment.user left join fetch appointment.service")
    List<Appointment> findAllWithToOneRelationships();

    @Query(
        "select appointment from Appointment appointment left join fetch appointment.user left join fetch appointment.service where appointment.id =:id"
    )
    Optional<Appointment> findOneWithToOneRelationships(@Param("id") Long id);

    /**
     * Find overlapping appointments for a user and service within a time range.
     */
    @Query("select a from Appointment a where a.user.id = :userId and a.service.id = :serviceId and a.status in ('REQUESTED', 'SCHEDULED') and ((a.startTime < :endTime and a.endTime > :startTime))")
    List<Appointment> findOverlappingAppointments(@Param("userId") Long userId, @Param("serviceId") Long serviceId, @Param("startTime") java.time.Instant startTime, @Param("endTime") java.time.Instant endTime);

    /**
     * Count appointments for a user on a specific day.
     */
    @Query("select count(a) from Appointment a where a.user.id = :userId and a.status in ('REQUESTED', 'SCHEDULED') and function('date', a.startTime) = function('date', :date)")
    Long countAppointmentsForUserOnDay(@Param("userId") Long userId, @Param("date") java.time.Instant date);
    
    /**
     * Find past appointments for the current user.
     */
    @Query("select a from Appointment a left join fetch a.service where a.user.login = ?#{authentication.name} and a.endTime < CURRENT_TIMESTAMP order by a.startTime desc")
    Page<Appointment> findPastAppointmentsForCurrentUser(Pageable pageable);
}
