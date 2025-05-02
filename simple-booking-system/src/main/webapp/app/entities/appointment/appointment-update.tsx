import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Col, FormText, Row, Alert, Badge } from 'reactstrap';
import { Translate, ValidatedField, ValidatedForm, translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getUsers } from 'app/modules/administration/user-management/user-management.reducer';
import { getEntities as getServices } from 'app/entities/service/service.reducer';
import { AppointmentStatus } from 'app/shared/model/enumerations/appointment-status.model';
import { createEntity, getEntity, reset, updateEntity } from './appointment.reducer';

export const AppointmentUpdate = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [creationSuccess, setCreationSuccess] = useState(false);

  const { id } = useParams<'id'>();
  const isNew = id === undefined;

  const users = useAppSelector(state => state.userManagement.users);
  const services = useAppSelector(state => state.service.entities);
  const appointmentEntity = useAppSelector(state => state.appointment.entity);
  const loading = useAppSelector(state => state.appointment.loading);
  const updating = useAppSelector(state => state.appointment.updating);
  const updateSuccess = useAppSelector(state => state.appointment.updateSuccess);
  const appointmentStatusValues = Object.keys(AppointmentStatus);

  const handleClose = () => {
    navigate(`/appointment${location.search}`);
  };

  useEffect(() => {
    if (isNew) {
      dispatch(reset());
    } else {
      dispatch(getEntity(id));
    }

    dispatch(getUsers({}));
    dispatch(getServices({}));
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      if (isNew) {
        setCreationSuccess(true);
        setTimeout(() => {
          handleClose();
        }, 5000);
      } else {
        handleClose();
      }
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    if (values.id !== undefined && typeof values.id !== 'number') {
      values.id = Number(values.id);
    }
    values.startTime = convertDateTimeToServer(values.startTime);
    values.endTime = convertDateTimeToServer(values.endTime);

    if (values.endTime <= values.startTime) {
      setErrorMessage('End time must be after start time');
      return;
    }

    const entity = {
      ...appointmentEntity,
      ...values,
      user: users.find(it => it.id.toString() === values.user?.toString()),
      service: services.find(it => it.id.toString() === values.service?.toString()),
    };

    if (isNew) {
      entity.status = 'REQUESTED';
      dispatch(createEntity(entity))
        .unwrap()
        .catch(error => {
          if (error && error.message) {
            setErrorMessage(error.message);
          } else {
            setErrorMessage('Error creating appointment');
          }
        });
    } else {
      dispatch(updateEntity(entity))
        .unwrap()
        .catch(error => {
          if (error && error.message) {
            setErrorMessage(error.message);
          } else {
            setErrorMessage('Error updating appointment');
          }
        });
    }
  };

  const defaultValues = () =>
    isNew
      ? {
          startTime: displayDefaultDateTime(),
          endTime: displayDefaultDateTime(),
          status: 'REQUESTED',
        }
      : {
          ...appointmentEntity,
          startTime: convertDateTimeFromServer(appointmentEntity.startTime),
          endTime: convertDateTimeFromServer(appointmentEntity.endTime),
          user: appointmentEntity?.user?.id,
          service: appointmentEntity?.service?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="simpleBookingSystemApp.appointment.home.createOrEditLabel" data-cy="AppointmentCreateUpdateHeading">
            <Translate contentKey="simpleBookingSystemApp.appointment.home.createOrEditLabel">Create or edit a Appointment</Translate>
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        {creationSuccess && (
          <Col md="8">
            <Alert color="success">
              <Translate contentKey="simpleBookingSystemApp.appointment.created">
                A new Appointment request has been submitted and is pending approval
              </Translate>
              <p className="mt-2">
                <Translate contentKey="simpleBookingSystemApp.appointment.approvalMessage">
                  Your booking will be confirmed after admin approval. You will receive a confirmation email once approved.
                </Translate>
              </p>
              <p className="mt-2">
                <Badge color="warning" className="px-3 py-2">
                  <FontAwesomeIcon icon="clock" className="me-1" />
                  <Translate contentKey="simpleBookingSystemApp.appointment.pendingApproval">Pending Approval</Translate>
                </Badge>
              </p>
            </Alert>
          </Col>
        )}
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              {errorMessage && (
                <Alert color="danger" fade={false}>
                  {errorMessage}
                </Alert>
              )}
              <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
                {!isNew ? (
                  <ValidatedField
                    name="id"
                    required
                    readOnly
                    id="appointment-id"
                    label={translate('global.field.id')}
                    validate={{ required: true }}
                  />
                ) : null}
                <ValidatedField
                  label={translate('simpleBookingSystemApp.appointment.startTime')}
                  id="appointment-startTime"
                  name="startTime"
                  data-cy="startTime"
                  type="datetime-local"
                  placeholder="YYYY-MM-DD HH:mm"
                  validate={{
                    required: { value: true, message: translate('entity.validation.required') },
                    validate(value) {
                      if (isNew && new Date(value) < new Date()) {
                        return 'Cannot schedule appointments in the past';
                      }
                      return true;
                    },
                  }}
                />
                <ValidatedField
                  label={translate('simpleBookingSystemApp.appointment.endTime')}
                  id="appointment-endTime"
                  name="endTime"
                  data-cy="endTime"
                  type="datetime-local"
                  placeholder="YYYY-MM-DD HH:mm"
                  validate={{
                    required: { value: true, message: translate('entity.validation.required') },
                    validate(value) {
                      if (isNew && new Date(value) < new Date()) {
                        return 'Cannot schedule appointments in the past';
                      }
                      return true;
                    },
                  }}
                />
                {!isNew && (
                  <ValidatedField
                    label={translate('simpleBookingSystemApp.appointment.status')}
                    id="appointment-status"
                    name="status"
                    data-cy="status"
                    type="select"
                  >
                    {appointmentStatusValues.map(appointmentStatus => (
                      <option value={appointmentStatus} key={appointmentStatus}>
                        {translate(`simpleBookingSystemApp.AppointmentStatus.${appointmentStatus}`)}
                      </option>
                    ))}
                  </ValidatedField>
                )}
                {isNew && (
                  <Alert color="info" className="mt-3">
                    <p>
                      <FontAwesomeIcon icon="info-circle" className="me-1" />
                      <Translate contentKey="simpleBookingSystemApp.appointment.approvalMessage">
                        Your booking will be confirmed after admin approval. You will receive a confirmation email once approved.
                      </Translate>
                    </p>
                    <p className="mb-0">
                      <Translate contentKey="simpleBookingSystemApp.appointment.cancellationPolicy">
                        Cancellations are only allowed up to 24 hours before your scheduled appointment.
                      </Translate>
                    </p>
                  </Alert>
                )}
                <ValidatedField
                  id="appointment-user"
                  name="user"
                  data-cy="user"
                  label={translate('simpleBookingSystemApp.appointment.user')}
                  type="select"
                  required
                >
                  <option value="" key="0" />
                  {users
                    ? users.map(otherEntity => (
                        <option value={otherEntity.id} key={otherEntity.id}>
                          {otherEntity.login}
                        </option>
                      ))
                    : null}
                </ValidatedField>
                <FormText>
                  <Translate contentKey="entity.validation.required">This field is required.</Translate>
                </FormText>
                <ValidatedField
                  id="appointment-service"
                  name="service"
                  data-cy="service"
                  label={translate('simpleBookingSystemApp.appointment.service')}
                  type="select"
                >
                  <option value="" key="0" />
                  {services
                    ? services.map(otherEntity => (
                        <option value={otherEntity.id} key={otherEntity.id}>
                          {otherEntity.name}
                        </option>
                      ))
                    : null}
                </ValidatedField>
                <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/appointment" replace color="info">
                  <FontAwesomeIcon icon="arrow-left" />
                  &nbsp;
                  <span className="d-none d-md-inline">
                    <Translate contentKey="entity.action.back">Back</Translate>
                  </span>
                </Button>
                &nbsp;
                <Button color="primary" id="save-entity" data-cy="entityCreateSaveButton" type="submit" disabled={updating}>
                  <FontAwesomeIcon icon="save" />
                  &nbsp;
                  <Translate contentKey="entity.action.save">Save</Translate>
                </Button>
              </ValidatedForm>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default AppointmentUpdate;
