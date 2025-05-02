import React, { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button, Col, Row, Badge } from 'reactstrap';
import { TextFormat, Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faClock } from '@fortawesome/free-solid-svg-icons';

import { APP_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { hasAnyAuthority } from 'app/shared/auth/private-route';
import { AUTHORITIES } from 'app/config/constants';

import { getEntity, approveAppointment, rejectAppointment } from './appointment.reducer';

export const AppointmentDetail = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { id } = useParams<'id'>();
  const updating = useAppSelector(state => state.appointment.updating);
  const updateSuccess = useAppSelector(state => state.appointment.updateSuccess);

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      dispatch(getEntity(id));
    }
  }, [updateSuccess]);

  const handleApprove = () => {
    // Direct browser navigation workaround
    window.location.href = `/api/appointments/${id}/approve-test`;
  };

  const handleReject = () => {
    dispatch(rejectAppointment(id));
    navigate('/appointment');
  };

  const userAuthorities = useAppSelector(state => state.authentication.account.authorities);

  const appointmentEntity = useAppSelector(state => state.appointment.entity);
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="appointmentDetailsHeading">
          <Translate contentKey="simpleBookingSystemApp.appointment.detail.title">Appointment</Translate>
        </h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">
              <Translate contentKey="global.field.id">ID</Translate>
            </span>
          </dt>
          <dd>{appointmentEntity.id}</dd>
          <dt>
            <span id="startTime">
              <Translate contentKey="simpleBookingSystemApp.appointment.startTime">Start Time</Translate>
            </span>
          </dt>
          <dd>
            {appointmentEntity.startTime ? <TextFormat value={appointmentEntity.startTime} type="date" format={APP_DATE_FORMAT} /> : null}
          </dd>
          <dt>
            <span id="endTime">
              <Translate contentKey="simpleBookingSystemApp.appointment.endTime">End Time</Translate>
            </span>
          </dt>
          <dd>
            {appointmentEntity.endTime ? <TextFormat value={appointmentEntity.endTime} type="date" format={APP_DATE_FORMAT} /> : null}
          </dd>
          <dt>
            <span id="status">
              <Translate contentKey="simpleBookingSystemApp.appointment.status">Status</Translate>
            </span>
          </dt>
          <dd>
            <Translate contentKey={`simpleBookingSystemApp.AppointmentStatus.${appointmentEntity.status}`} />
            {appointmentEntity.status === 'REQUESTED' && (
              <Badge color="warning" className="ms-2">
                <FontAwesomeIcon icon={faClock} className="me-1" />
                <Translate contentKey="simpleBookingSystemApp.appointment.pendingApproval">Pending Approval</Translate>
              </Badge>
            )}
            {appointmentEntity.status === 'SCHEDULED' && (
              <Badge color="success" className="ms-2">
                <FontAwesomeIcon icon={faCheck} className="me-1" />
                <Translate contentKey="simpleBookingSystemApp.appointment.approved">Approved</Translate>
              </Badge>
            )}
            {appointmentEntity.status === 'CANCELLED' && (
              <Badge color="danger" className="ms-2">
                <FontAwesomeIcon icon={faTimes} className="me-1" />
                <Translate contentKey="simpleBookingSystemApp.appointment.cancelled">Cancelled</Translate>
              </Badge>
            )}
          </dd>
          <dt>
            <Translate contentKey="simpleBookingSystemApp.appointment.user">User</Translate>
          </dt>
          <dd>{appointmentEntity.user ? appointmentEntity.user.login : ''}</dd>
          <dt>
            <Translate contentKey="simpleBookingSystemApp.appointment.service">Service</Translate>
          </dt>
          <dd>{appointmentEntity.service ? appointmentEntity.service.name : ''}</dd>
        </dl>
        <Button tag={Link} to="/appointment" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.back">Back</Translate>
          </span>
        </Button>
        &nbsp;
        {hasAnyAuthority([AUTHORITIES.ADMIN], userAuthorities) && appointmentEntity.status === 'REQUESTED' && (
          <>
            <Button onClick={handleApprove} color="success" data-cy="entityApproveButton">
              <FontAwesomeIcon icon={faCheck} />{' '}
              <span className="d-none d-md-inline">
                <Translate contentKey="entity.action.approve">Approve</Translate>
              </span>
            </Button>
            &nbsp;
            <Button onClick={handleReject} color="danger" data-cy="entityRejectButton">
              <FontAwesomeIcon icon={faTimes} />{' '}
              <span className="d-none d-md-inline">
                <Translate contentKey="entity.action.reject">Reject</Translate>
              </span>
            </Button>
            &nbsp;
          </>
        )}
        <Button tag={Link} to={`/appointment/${appointmentEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.edit">Edit</Translate>
          </span>
        </Button>
      </Col>
    </Row>
  );
};

export default AppointmentDetail;
