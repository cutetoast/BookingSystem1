package com.mycompany.myapp.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link com.mycompany.myapp.domain.RejectedBooking} entity.
 */
public class RejectedBookingDTO implements Serializable {

    private Long id;

    @NotNull
    private Long userId;

    @NotNull
    private Long serviceId;

    @NotNull
    private Instant startTime;

    @NotNull
    private Instant endTime;

    @NotNull
    private Instant rejectionTime;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getEndTime() {
        return endTime;
    }

    public void setEndTime(Instant endTime) {
        this.endTime = endTime;
    }

    public Instant getRejectionTime() {
        return rejectionTime;
    }

    public void setRejectionTime(Instant rejectionTime) {
        this.rejectionTime = rejectionTime;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof RejectedBookingDTO)) {
            return false;
        }

        RejectedBookingDTO rejectedBookingDTO = (RejectedBookingDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, rejectedBookingDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    @Override
    public String toString() {
        return "RejectedBookingDTO{" +
            "id=" + getId() +
            ", userId=" + getUserId() +
            ", serviceId=" + getServiceId() +
            ", startTime='" + getStartTime() + "'" +
            ", endTime='" + getEndTime() + "'" +
            ", rejectionTime='" + getRejectionTime() + "'" +
            "}";
    }
} 