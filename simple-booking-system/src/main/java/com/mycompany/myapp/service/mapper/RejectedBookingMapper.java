package com.mycompany.myapp.service.mapper;

import com.mycompany.myapp.domain.RejectedBooking;
import com.mycompany.myapp.service.dto.RejectedBookingDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link RejectedBooking} and its DTO {@link RejectedBookingDTO}.
 */
@Mapper(componentModel = "spring")
public interface RejectedBookingMapper extends EntityMapper<RejectedBookingDTO, RejectedBooking> {
} 