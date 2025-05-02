import React, { useState } from 'react';
import { Translate } from 'react-jhipster';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dropdown, DropdownItem, DropdownToggle, DropdownMenu } from 'reactstrap';

import MenuItem from 'app/shared/layout/menus/menu-item';

const EntitiesMenu = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleOpen = () => setDropdownOpen(!dropdownOpen);

  return (
    <Dropdown
      isOpen={dropdownOpen}
      onMouseEnter={toggleOpen}
      onMouseLeave={toggleOpen}
      toggle={toggleOpen}
      nav
      data-cy="entity"
      id="entity-menu"
      data-testid="entityMenu"
    >
      <DropdownToggle nav caret className="d-flex align-items-center">
        <FontAwesomeIcon icon="th-list" />
        <span className="ms-1">
          <Translate contentKey="global.menu.entities.main">Entities</Translate>
        </span>
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem tag={Link} to="/appointment">
          <FontAwesomeIcon icon="asterisk" fixedWidth />
          &nbsp;
          <Translate contentKey="global.menu.entities.appointment" />
        </DropdownItem>

        <DropdownItem tag={Link} to="/appointment/history">
          <FontAwesomeIcon icon="history" fixedWidth />
          &nbsp;
          <Translate contentKey="global.menu.entities.appointmentHistory" />
        </DropdownItem>

        <DropdownItem tag={Link} to="/service">
          <FontAwesomeIcon icon="asterisk" fixedWidth />
          &nbsp;
          <Translate contentKey="global.menu.entities.service" />
        </DropdownItem>
        {/* jhipster-needle-add-entity-to-menu - JHipster will add entities to the menu here */}
      </DropdownMenu>
    </Dropdown>
  );
};

export default EntitiesMenu;
