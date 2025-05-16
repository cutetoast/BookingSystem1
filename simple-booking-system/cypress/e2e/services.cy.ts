/// <reference types="cypress" />

describe('Service Management', () => {
  beforeEach(() => {
    // Login before each test
    cy.login('user', 'user');
    // Visit the services page
    cy.visit('/service');
  });

  it('should display the services list', () => {
    // Check if the services list is visible
    cy.get('[data-cy="services-list"]').should('be.visible');
  });

  it('should create a new service', () => {
    // Click the create service button
    cy.get('[data-cy="create-service"]').click();

    // Fill in the service form
    cy.get('[data-cy="service-name"]').type('Test Service');
    cy.get('[data-cy="service-duration"]').type('60');
    cy.get('[data-cy="service-price"]').type('100');
    cy.get('[data-cy="service-description"]').type('This is a test service');

    // Submit the form
    cy.get('[data-cy="submit-service"]').click();

    // Verify success message
    cy.get('[data-cy="success-message"]').should('be.visible');
  });

  it('should edit an existing service', () => {
    // Click the edit button on the first service
    cy.get('[data-cy="edit-service"]').first().click();

    // Update the service description
    cy.get('[data-cy="service-description"]').clear().type('Updated service description');

    // Submit the form
    cy.get('[data-cy="submit-service"]').click();

    // Verify success message
    cy.get('[data-cy="success-message"]').should('be.visible');
  });

  it('should delete a service', () => {
    // Click the delete button on the first service
    cy.get('[data-cy="delete-service"]').first().click();

    // Confirm deletion
    cy.get('[data-cy="confirm-delete"]').click();

    // Verify success message
    cy.get('[data-cy="success-message"]').should('be.visible');
  });
}); 