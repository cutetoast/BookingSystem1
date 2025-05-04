import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Col, Row, Badge, Alert, Card, CardHeader, CardBody } from 'reactstrap';
import { TextFormat, Translate, translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faClock, faInfo } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

import { APP_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { hasAnyAuthority } from 'app/shared/auth/private-route';
import { AUTHORITIES } from 'app/config/constants';

import { getEntity, approveAppointment, rejectAppointment } from './appointment.reducer';

export const AppointmentDetail = () => {
  const dispatch = useAppDispatch();

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
    dispatch(approveAppointment(id))
      .unwrap()
      .then(() => {
        toast.success(translate('simpleBookingSystemApp.appointment.approved'));
      })
      .catch(error => {
        const errorMsg = error?.response?.data?.detail || 'Error approving appointment';
        toast.error(errorMsg);
        if (error?.response?.status === 401) {
          toast.error('You must be an administrator to approve appointments');
        }
      });
  };

  const handleReject = () => {
    dispatch(rejectAppointment(id))
      .unwrap()
      .then(() => {
        toast.success(translate('simpleBookingSystemApp.appointment.rejected'));
      })
      .catch(error => {
        const errorMsg = error?.response?.data?.detail || 'Error rejecting appointment';
        toast.error(errorMsg);
        if (error?.response?.status === 401) {
          toast.error('You must be an administrator to reject appointments');
        }
      });
  };

  const userAuthorities = useAppSelector(state => state.authentication.account.authorities);

  const appointmentEntity = useAppSelector(state => state.appointment.entity);

  // Calculate if we're within 24 hours of the appointment start time
  const isWithin24Hours = appointmentEntity.startTime
    ? new Date(appointmentEntity.startTime).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000
    : false;

  // Helper function for status badges
  const getStatusBadge = status => {
    switch (status) {
      case 'REQUESTED':
        return (
          <Badge color="warning" className="p-2">
            <FontAwesomeIcon icon={faClock} className="me-1" />
            <Translate contentKey="simpleBookingSystemApp.appointment.pendingApproval">Pending Approval</Translate>
          </Badge>
        );
      case 'SCHEDULED':
        return (
          <Badge color="success" className="p-2">
            <FontAwesomeIcon icon={faCheck} className="me-1" />
            <Translate contentKey="simpleBookingSystemApp.appointment.approved">Approved</Translate>
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge color="danger" className="p-2">
            <FontAwesomeIcon icon={faTimes} className="me-1" />
            <Translate contentKey="simpleBookingSystemApp.appointment.cancelled">Cancelled</Translate>
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge color="info" className="p-2">
            <FontAwesomeIcon icon={faCheck} className="me-1" />
            <Translate contentKey="simpleBookingSystemApp.appointment.completed">Completed</Translate>
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 data-cy="appointmentDetailsHeading">
            <Translate contentKey="simpleBookingSystemApp.appointment.detail.title">Appointment</Translate>
          </h2>
          <Card className="mb-4">
            <CardHeader className="bg-light">
              <h4 className="mb-0">
                <Translate contentKey="simpleBookingSystemApp.appointment.detail.subtitle">Appointment Details</Translate>
              </h4>
            </CardHeader>
            <CardBody>
              <Row className="mb-2">
                <Col md="4" className="fw-bold">
                  <Translate contentKey="simpleBookingSystemApp.appointment.id">ID</Translate>
                </Col>
                <Col md="8">{appointmentEntity.id}</Col>
              </Row>
              <Row className="mb-2">
                <Col md="4" className="fw-bold">
                  <Translate contentKey="simpleBookingSystemApp.appointment.startTime">Start Time</Translate>
                </Col>
                <Col md="8">
                  {appointmentEntity.startTime ? (
                    <TextFormat value={appointmentEntity.startTime} type="date" format={APP_DATE_FORMAT} />
                  ) : null}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md="4" className="fw-bold">
                  <Translate contentKey="simpleBookingSystemApp.appointment.endTime">End Time</Translate>
                </Col>
                <Col md="8">
                  {appointmentEntity.endTime ? <TextFormat value={appointmentEntity.endTime} type="date" format={APP_DATE_FORMAT} /> : null}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md="4" className="fw-bold">
                  <Translate contentKey="simpleBookingSystemApp.appointment.status">Status</Translate>
                </Col>
                <Col md="8">{getStatusBadge(appointmentEntity.status)}</Col>
              </Row>
              <Row className="mb-2">
                <Col md="4" className="fw-bold">
                  <Translate contentKey="simpleBookingSystemApp.appointment.user">User</Translate>
                </Col>
                <Col md="8">{appointmentEntity.user ? appointmentEntity.user.login : ''}</Col>
              </Row>
              <Row className="mb-2">
                <Col md="4" className="fw-bold">
                  <Translate contentKey="simpleBookingSystemApp.appointment.service">Service</Translate>
                </Col>
                <Col md="8">
                  {appointmentEntity.service ? (
                    <Link to={`/service/${appointmentEntity.service.id}`}>{appointmentEntity.service.name}</Link>
                  ) : (
                    ''
                  )}
                </Col>
              </Row>
            </CardBody>
          </Card>
          {appointmentEntity.status === 'REQUESTED' && (
            <Alert color="warning">
              <FontAwesomeIcon icon={faClock} className="me-2" />
              <span>
                <Translate contentKey="simpleBookingSystemApp.appointment.pendingApprovalDescription">
                  This appointment is awaiting admin approval. You will receive an email once it has been approved.
                </Translate>
              </span>
            </Alert>
          )}
          {appointmentEntity.status === 'SCHEDULED' && isWithin24Hours && (
            <Alert color="danger">
              <FontAwesomeIcon icon={faInfo} className="me-2" />
              <span>
                <Translate contentKey="simpleBookingSystemApp.appointment.cancellationPolicy">
                  This appointment cannot be cancelled as it is scheduled to start within 24 hours.
                </Translate>
              </span>
            </Alert>
          )}
          {appointmentEntity.status === 'SCHEDULED' && !isWithin24Hours && (
            <Alert color="info">
              <FontAwesomeIcon icon={faInfo} className="me-2" />
              <span>
                <Translate contentKey="simpleBookingSystemApp.appointment.cancellationReminder">
                  Remember that cancellations are only allowed up to 24 hours before the scheduled appointment time.
                </Translate>
              </span>
            </Alert>
          )}
          <Button tag={Link} to="/appointment" replace color="info" data-cy="entityDetailsBackButton">
            <FontAwesomeIcon icon="arrow-left" />{' '}
            <span className="d-none d-md-inline">
              <Translate contentKey="entity.action.back">Back</Translate>
            </span>
          </Button>
          &nbsp;
          <Button tag={Link} to={`/appointment/${appointmentEntity.id}/edit`} replace color="primary">
            <FontAwesomeIcon icon="pencil-alt" />{' '}
            <span className="d-none d-md-inline">
              <Translate contentKey="entity.action.edit">Edit</Translate>
            </span>
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default AppointmentDetail;
