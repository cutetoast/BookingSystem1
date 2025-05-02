import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Button,
  Table,
  ButtonGroup,
  ButtonToolbar,
  Badge,
  Row,
  Col,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import { JhiItemCount, JhiPagination, TextFormat, Translate, getPaginationState } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortDown, faSortUp, faCheck, faTimes, faFilter, faClock } from '@fortawesome/free-solid-svg-icons';
import { APP_DATE_FORMAT } from 'app/config/constants';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { hasAnyAuthority } from 'app/shared/auth/private-route';
import { AUTHORITIES } from 'app/config/constants';

import { getEntities, approveAppointment, rejectAppointment } from './appointment.reducer';

export const Appointment = () => {
  const dispatch = useAppDispatch();
  const [errorMessage, setErrorMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(prevState => !prevState);

  const pageLocation = useLocation();
  const navigate = useNavigate();

  const [paginationState, setPaginationState] = useState(
    overridePaginationStateWithQueryParams(getPaginationState(pageLocation, ITEMS_PER_PAGE, 'id'), pageLocation.search),
  );

  const appointmentList = useAppSelector(state => state.appointment.entities);
  const loading = useAppSelector(state => state.appointment.loading);
  const totalItems = useAppSelector(state => state.appointment.totalItems);

  const getAllEntities = () => {
    dispatch(
      getEntities({
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

  const account = useAppSelector(state => state.authentication.account);
  const isAuthenticated = useAppSelector(state => state.authentication.isAuthenticated);

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

  const handleApprove = (id: string) => {
    setErrorMessage('');
    // Use window.location to navigate to the test endpoint directly
    // This will cause a page reload, but it will work around the API issue
    window.location.href = `/api/appointments/${id}/approve-test`;
    // After a short delay, navigate back to appointments
    setTimeout(() => {
      window.location.href = '/appointment';
    }, 1000);
  };

  const handleReject = (id: string) => {
    setErrorMessage('');
    // Use window.location to navigate to the test endpoint directly
    // This will cause a page reload, but it will work around the API issue
    window.location.href = `/api/appointments/${id}/reject-test`;
    // After a short delay, navigate back to appointments
    setTimeout(() => {
      window.location.href = '/appointment';
    }, 1000);
  };

  // Filter appointments based on the selected status
  let filteredAppointments = appointmentList;
  if (statusFilter !== 'ALL') {
    filteredAppointments = appointmentList.filter(appointment => appointment.status === statusFilter);
  }

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
      <h2 id="appointment-heading" data-cy="AppointmentHeading">
        <Translate contentKey="simpleBookingSystemApp.appointment.home.title">Appointments</Translate>
      </h2>

      <Row className="mb-3">
        <Col>
          <div className="d-flex">
            <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown} className="me-2">
              <DropdownToggle color="secondary" caret>
                <FontAwesomeIcon icon={faFilter} className="me-1" />
                {statusFilter === 'ALL' ? 'All Statuses' : statusFilter}
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem onClick={() => setStatusFilter('ALL')}>All Statuses</DropdownItem>
                <DropdownItem onClick={() => setStatusFilter('REQUESTED')}>Pending Approval</DropdownItem>
                <DropdownItem onClick={() => setStatusFilter('SCHEDULED')}>Approved</DropdownItem>
                <DropdownItem onClick={() => setStatusFilter('COMPLETED')}>Completed</DropdownItem>
                <DropdownItem onClick={() => setStatusFilter('CANCELLED')}>Cancelled</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Button onClick={handleSyncList} color="info" className="me-2">
              <FontAwesomeIcon icon="sync" />{' '}
              <Translate contentKey="simpleBookingSystemApp.appointment.home.refreshListLabel">Refresh List</Translate>
            </Button>

            <Link to="/appointment/new" className="btn btn-primary ms-auto" id="jh-create-entity" data-cy="entityCreateButton">
              <FontAwesomeIcon icon="plus" />
              &nbsp;
              <Translate contentKey="simpleBookingSystemApp.appointment.home.createLabel">Create new Appointment</Translate>
            </Link>
          </div>
        </Col>
      </Row>

      {errorMessage && (
        <div className="alert alert-danger" role="alert">
          {errorMessage}
        </div>
      )}

      <div className="table-responsive">
        {filteredAppointments && filteredAppointments.length > 0 ? (
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
                <th>
                  <Translate contentKey="simpleBookingSystemApp.appointment.user">User</Translate> <FontAwesomeIcon icon="sort" />
                </th>
                <th>
                  <Translate contentKey="simpleBookingSystemApp.appointment.service">Service</Translate> <FontAwesomeIcon icon="sort" />
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`/appointment/${appointment.id}`} color="link" size="sm">
                      {appointment.id}
                    </Button>
                  </td>
                  <td>
                    {appointment.startTime ? <TextFormat type="date" value={appointment.startTime} format={APP_DATE_FORMAT} /> : null}
                  </td>
                  <td>{appointment.endTime ? <TextFormat type="date" value={appointment.endTime} format={APP_DATE_FORMAT} /> : null}</td>
                  <td>{getStatusBadge(appointment.status)}</td>
                  <td>{appointment.user ? appointment.user.login : ''}</td>
                  <td>{appointment.service ? <Link to={`/service/${appointment.service.id}`}>{appointment.service.name}</Link> : ''}</td>
                  <td className="text-end">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`/appointment/${appointment.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.view">View</Translate>
                        </span>
                      </Button>
                      <Button tag={Link} to={`/appointment/${appointment.id}/edit`} color="primary" size="sm" data-cy="entityEditButton">
                        <FontAwesomeIcon icon="pencil-alt" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.edit">Edit</Translate>
                        </span>
                      </Button>
                      <Button
                        onClick={() => (location.href = `/appointment/${appointment.id}/delete`)}
                        color="danger"
                        size="sm"
                        data-cy="entityDeleteButton"
                      >
                        <FontAwesomeIcon icon="trash" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.delete">Delete</Translate>
                        </span>
                      </Button>
                      {hasAnyAuthority([AUTHORITIES.ADMIN], account.authorities) && appointment.status === 'REQUESTED' && (
                        <>
                          <Button onClick={() => handleApprove(appointment.id)} color="success" size="sm" data-cy="entityApproveButton">
                            <FontAwesomeIcon icon={faCheck} />{' '}
                            <span className="d-none d-md-inline">
                              <Translate contentKey="entity.action.approve">Approve</Translate>
                            </span>
                          </Button>
                          <Button onClick={() => handleReject(appointment.id)} color="danger" size="sm" data-cy="entityRejectButton">
                            <FontAwesomeIcon icon={faTimes} />{' '}
                            <span className="d-none d-md-inline">
                              <Translate contentKey="entity.action.reject">Reject</Translate>
                            </span>
                          </Button>
                        </>
                      )}
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
        <div className={filteredAppointments && filteredAppointments.length > 0 ? '' : 'd-none'}>
          <div className="justify-content-center d-flex">
            <JhiItemCount page={paginationState.activePage} total={totalItems} itemsPerPage={paginationState.itemsPerPage} i18nEnabled />
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
    </div>
  );
};

export default Appointment;
