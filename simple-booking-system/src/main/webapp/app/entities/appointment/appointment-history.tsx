import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Table, Row, Col, Badge, Card, CardHeader, CardBody } from 'reactstrap';
import { JhiItemCount, JhiPagination, TextFormat, Translate, getPaginationState } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortDown, faSortUp, faCheck, faTimes, faHistory, faClock } from '@fortawesome/free-solid-svg-icons';
import { APP_DATE_FORMAT } from 'app/config/constants';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getPastAppointments } from './appointment.reducer';

export const AppointmentHistory = () => {
  const dispatch = useAppDispatch();

  const pageLocation = useLocation();
  const navigate = useNavigate();

  const [paginationState, setPaginationState] = useState(
    overridePaginationStateWithQueryParams(getPaginationState(pageLocation, ITEMS_PER_PAGE, 'startTime'), pageLocation.search),
  );

  const appointmentList = useAppSelector(state => state.appointment.entities);
  const loading = useAppSelector(state => state.appointment.loading);
  const totalItems = useAppSelector(state => state.appointment.totalItems);

  const getAllEntities = () => {
    dispatch(
      getPastAppointments({
        page: paginationState.activePage - 1,
        size: paginationState.itemsPerPage,
        sort: `${paginationState.sort},${paginationState.order}`,
      }),
    );
  };

  const sortEntities = () => {
    getAllEntities();
    const endURL = `?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`;
    if (pageLocation.search !== endURL) {
      navigate(`${pageLocation.pathname}${endURL}`);
    }
  };

  useEffect(() => {
    sortEntities();
  }, [paginationState.activePage, paginationState.order, paginationState.sort]);

  useEffect(() => {
    const params = new URLSearchParams(pageLocation.search);
    const page = params.get('page');
    const sort = params.get(SORT);
    if (page && sort) {
      const sortSplit = sort.split(',');
      setPaginationState({
        ...paginationState,
        activePage: +page,
        sort: sortSplit[0],
        order: sortSplit[1],
      });
    }
  }, [pageLocation.search]);

  const sort = p => () => {
    setPaginationState({
      ...paginationState,
      order: paginationState.order === ASC ? DESC : ASC,
      sort: p,
    });
  };

  const handlePagination = currentPage =>
    setPaginationState({
      ...paginationState,
      activePage: currentPage,
    });

  const handleSyncList = () => {
    sortEntities();
  };

  const getSortIconByFieldName = (fieldName: string) => {
    const sortFieldName = paginationState.sort;
    const order = paginationState.order;
    if (sortFieldName !== fieldName) {
      return faSort;
    }
    return order === ASC ? faSortUp : faSortDown;
  };

  // Helper function for status badges
  const getStatusBadge = status => {
    switch (status) {
      case 'REQUESTED':
        return (
          <Badge color="warning" className="me-1">
            <FontAwesomeIcon icon={faClock} className="me-1" />
            <Translate contentKey="simpleBookingSystemApp.appointment.pendingApproval">Pending Approval</Translate>
          </Badge>
        );
      case 'SCHEDULED':
        return (
          <Badge color="success" className="me-1">
            <FontAwesomeIcon icon={faCheck} className="me-1" />
            <Translate contentKey="simpleBookingSystemApp.appointment.approved">Approved</Translate>
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge color="danger" className="me-1">
            <FontAwesomeIcon icon={faTimes} className="me-1" />
            <Translate contentKey="simpleBookingSystemApp.appointment.cancelled">Cancelled</Translate>
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge color="info" className="me-1">
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
      <h2 id="appointment-history-heading" data-cy="AppointmentHistoryHeading">
        <FontAwesomeIcon icon={faHistory} className="me-1" />
        <Translate contentKey="simpleBookingSystemApp.appointment.history.title">Booking History</Translate>
      </h2>

      <Card className="mb-4">
        <CardHeader>
          <h4 className="mb-0">Past Appointments</h4>
        </CardHeader>
        <CardBody>
          <div className="table-responsive">
            {appointmentList && appointmentList.length > 0 ? (
              <Table responsive>
                <thead>
                  <tr>
                    <th className="hand" onClick={sort('id')}>
                      <Translate contentKey="simpleBookingSystemApp.appointment.id">ID</Translate>{' '}
                      <FontAwesomeIcon icon={getSortIconByFieldName('id')} />
                    </th>
                    <th className="hand" onClick={sort('startTime')}>
                      <Translate contentKey="simpleBookingSystemApp.appointment.startTime">Start Time</Translate>{' '}
                      <FontAwesomeIcon icon={getSortIconByFieldName('startTime')} />
                    </th>
                    <th className="hand" onClick={sort('endTime')}>
                      <Translate contentKey="simpleBookingSystemApp.appointment.endTime">End Time</Translate>{' '}
                      <FontAwesomeIcon icon={getSortIconByFieldName('endTime')} />
                    </th>
                    <th className="hand" onClick={sort('status')}>
                      <Translate contentKey="simpleBookingSystemApp.appointment.status">Status</Translate>{' '}
                      <FontAwesomeIcon icon={getSortIconByFieldName('status')} />
                    </th>
                    <th className="hand" onClick={sort('service.name')}>
                      <Translate contentKey="simpleBookingSystemApp.appointment.service">Service</Translate>{' '}
                      <FontAwesomeIcon icon={getSortIconByFieldName('service.name')} />
                    </th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {appointmentList.map((appointment, i) => (
                    <tr key={`entity-${i}`} data-cy="entityTable">
                      <td>
                        <Button tag={Link} to={`/appointment/${appointment.id}`} color="link" size="sm">
                          {appointment.id}
                        </Button>
                      </td>
                      <td>
                        {appointment.startTime ? <TextFormat type="date" value={appointment.startTime} format={APP_DATE_FORMAT} /> : null}
                      </td>
                      <td>
                        {appointment.endTime ? <TextFormat type="date" value={appointment.endTime} format={APP_DATE_FORMAT} /> : null}
                      </td>
                      <td>{getStatusBadge(appointment.status)}</td>
                      <td>
                        {appointment.service ? <Link to={`/service/${appointment.service.id}`}>{appointment.service.name}</Link> : ''}
                      </td>
                      <td className="text-end">
                        <div className="btn-group flex-btn-group-container">
                          <Button tag={Link} to={`/appointment/${appointment.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                            <FontAwesomeIcon icon="eye" />{' '}
                            <span className="d-none d-md-inline">
                              <Translate contentKey="entity.action.view">View</Translate>
                            </span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              !loading && (
                <div className="alert alert-warning">
                  <Translate contentKey="simpleBookingSystemApp.appointment.home.notFound">No Appointments found</Translate>
                </div>
              )
            )}
          </div>
          {totalItems ? (
            <div className={appointmentList && appointmentList.length > 0 ? '' : 'd-none'}>
              <div className="justify-content-center d-flex">
                <JhiItemCount
                  page={paginationState.activePage}
                  total={totalItems}
                  itemsPerPage={paginationState.itemsPerPage}
                  i18nEnabled
                />
              </div>
              <div className="justify-content-center d-flex">
                <JhiPagination
                  activePage={paginationState.activePage}
                  onSelect={handlePagination}
                  maxButtons={5}
                  itemsPerPage={paginationState.itemsPerPage}
                  totalItems={totalItems}
                />
              </div>
            </div>
          ) : (
            ''
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default AppointmentHistory;
