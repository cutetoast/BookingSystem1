package com.mycompany.myapp.service;

import com.mycompany.myapp.domain.Appointment;
import com.mycompany.myapp.domain.User;
import com.mycompany.myapp.domain.enumeration.AppointmentStatus;
import com.mycompany.myapp.repository.AppointmentRepository;
import com.mycompany.myapp.repository.UserRepository;
import com.mycompany.myapp.service.dto.AppointmentDTO;
import com.mycompany.myapp.service.mapper.AppointmentMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.mycompany.myapp.domain.Appointment}.
 */
@Service
@Transactional
public class AppointmentService {

    private static final Logger LOG = LoggerFactory.getLogger(AppointmentService.class);
    
    private static final int MAX_APPOINTMENTS_PER_DAY = 3;

    private final AppointmentRepository appointmentRepository;

    private final AppointmentMapper appointmentMapper;
    
    private final MailService mailService;
    
    private final UserRepository userRepository;

    public AppointmentService(
        AppointmentRepository appointmentRepository, 
        AppointmentMapper appointmentMapper,
        MailService mailService,
        UserRepository userRepository
    ) {
        this.appointmentRepository = appointmentRepository;
        this.appointmentMapper = appointmentMapper;
        this.mailService = mailService;
        this.userRepository = userRepository;
    }

    /**
     * Save a appointment.
     *
     * @param appointmentDTO the entity to save.
     * @return the persisted entity.
     */
    public AppointmentDTO save(AppointmentDTO appointmentDTO) {
        LOG.debug("Request to save Appointment : {}", appointmentDTO);
        Appointment appointment = appointmentMapper.toEntity(appointmentDTO);
        // Set status to REQUESTED by default for new appointments
        appointment.setStatus(AppointmentStatus.REQUESTED);
        
        // Prevent overlapping appointments for the same user/service
        if (appointment.getUser() != null && appointment.getService() != null) {
            var overlaps = appointmentRepository.findOverlappingAppointments(
                appointment.getUser().getId(),
                appointment.getService().getId(),
                appointment.getStartTime(),
                appointment.getEndTime()
            );
            if (!overlaps.isEmpty()) {
                throw new IllegalStateException("Overlapping appointment exists for this user and service in the selected time range.");
            }
            
            // Check if user has already booked 3 appointments on this day
            Long appointmentsCount = appointmentRepository.countAppointmentsForUserOnDay(
                appointment.getUser().getId(),
                appointment.getStartTime()
            );
            
            if (appointmentsCount >= MAX_APPOINTMENTS_PER_DAY) {
                throw new IllegalStateException("You have reached the maximum limit of " + MAX_APPOINTMENTS_PER_DAY + " bookings per day.");
            }
        }
        
        appointment = appointmentRepository.save(appointment);
        return appointmentMapper.toDto(appointment);
    }

    /**
     * Update a appointment.
     *
     * @param appointmentDTO the entity to save.
     * @return the persisted entity.
     */
    public AppointmentDTO update(AppointmentDTO appointmentDTO) {
        LOG.debug("Request to update Appointment : {}", appointmentDTO);
        Appointment appointment = appointmentMapper.toEntity(appointmentDTO);
        appointment = appointmentRepository.save(appointment);
        return appointmentMapper.toDto(appointment);
    }

    /**
     * Partially update a appointment.
     *
     * @param appointmentDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<AppointmentDTO> partialUpdate(AppointmentDTO appointmentDTO) {
        LOG.debug("Request to partially update Appointment : {}", appointmentDTO);

        return appointmentRepository
            .findById(appointmentDTO.getId())
            .map(existingAppointment -> {
                appointmentMapper.partialUpdate(existingAppointment, appointmentDTO);

                return existingAppointment;
            })
            .map(appointmentRepository::save)
            .map(appointmentMapper::toDto);
    }

    /**
     * Get all the appointments.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<AppointmentDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Appointments");
        return appointmentRepository.findAll(pageable).map(appointmentMapper::toDto);
    }

    /**
     * Get all the appointments with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<AppointmentDTO> findAllWithEagerRelationships(Pageable pageable) {
        return appointmentRepository.findAllWithEagerRelationships(pageable).map(appointmentMapper::toDto);
    }

    /**
     * Get one appointment by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<AppointmentDTO> findOne(Long id) {
        LOG.debug("Request to get Appointment : {}", id);
        return appointmentRepository.findOneWithEagerRelationships(id).map(appointmentMapper::toDto);
    }

    /**
     * Delete the appointment by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Appointment : {}", id);
        appointmentRepository.deleteById(id);
    }

    /**
     * Approve an appointment request.
     *
     * @param id the id of the appointment to approve.
     * @return the persisted entity.
     */
    @Transactional
    public Optional<AppointmentDTO> approveAppointment(Long id) {
        LOG.debug("Request to approve Appointment : {}", id);
        
        return appointmentRepository.findById(id)
            .map(appointment -> {
                LOG.info("Found appointment: {}, current status: {}", id, appointment.getStatus());
                if (appointment.getStatus() == AppointmentStatus.REQUESTED) {
                    LOG.info("Updating appointment status from REQUESTED to SCHEDULED");
                    appointment.setStatus(AppointmentStatus.SCHEDULED);
                    appointment = appointmentRepository.save(appointment);
                    
                    // Send confirmation email to user
                    User user = appointment.getUser();
                    AppointmentDTO appointmentDTO = appointmentMapper.toDto(appointment);
                    mailService.sendAppointmentConfirmationEmail(user, appointmentDTO);
                    
                    return appointmentDTO;
                } else {
                    LOG.warn("Cannot approve appointment with status: {}", appointment.getStatus());
                    return appointmentMapper.toDto(appointment);
                }
            });
    }

    /**
     * Reject an appointment request.
     *
     * @param id the id of the appointment to reject.
     * @return the persisted entity.
     */
    @Transactional
    public Optional<AppointmentDTO> rejectAppointment(Long id) {
        LOG.debug("Request to reject Appointment : {}", id);
        
        return appointmentRepository.findById(id)
            .map(appointment -> {
                LOG.info("Found appointment: {}, current status: {}", id, appointment.getStatus());
                if (appointment.getStatus() == AppointmentStatus.REQUESTED) {
                    LOG.info("Updating appointment status from REQUESTED to CANCELLED");
                    appointment.setStatus(AppointmentStatus.CANCELLED);
                    appointment = appointmentRepository.save(appointment);
                    
                    // Notify user of rejection
                    User user = appointment.getUser();
                    AppointmentDTO appointmentDTO = appointmentMapper.toDto(appointment);
                    mailService.sendAppointmentCancellationEmail(user, appointmentDTO);
                    
                    return appointmentDTO;
                } else {
                    LOG.warn("Cannot reject appointment with status: {}", appointment.getStatus());
                    return appointmentMapper.toDto(appointment);
                }
            });
    }
}
