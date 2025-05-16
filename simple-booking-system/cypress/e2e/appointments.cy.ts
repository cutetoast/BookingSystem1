/// <reference types="cypress" />

describe('Appointment Management', () => {
  beforeEach(() => {
    // Login before each test
    cy.login('user', 'user');
    // Visit the appointments page
    cy.visit('/appointment');
  });

  it('should display the appointments list', () => {
    // Check if the appointments list is visible
    cy.get('[data-cy="appointments-list"]').should('be.visible');
  });

  it('should create a new appointment', () => {
    // Click the create appointment button
    cy.get('[data-cy="create-appointment"]').click();

    // Fill in the appointment form
    cy.get('[data-cy="appointment-date"]').type('2024-05-20');
    cy.get('[data-cy="appointment-time"]').type('14:00');
    cy.get('[data-cy="appointment-service"]').select('1'); // Assuming 1 is a valid service ID
    cy.get('[data-cy="appointment-notes"]').type('Test appointment');

    // Submit the form
    cy.get('[data-cy="submit-appointment"]').click();

    // Verify success message
    cy.get('[data-cy="success-message"]').should('be.visible');
  });

  it('should edit an existing appointment', () => {
    // Click the edit button on the first appointment
    cy.get('[data-cy="edit-appointment"]').first().click();

    // Update the appointment notes
    cy.get('[data-cy="appointment-notes"]').clear().type('Updated appointment notes');

    // Submit the form
    cy.get('[data-cy="submit-appointment"]').click();

    // Verify success message
    cy.get('[data-cy="success-message"]').should('be.visible');
  });

  it('should delete an appointment', () => {
    // Click the delete button on the first appointment
    cy.get('[data-cy="delete-appointment"]').first().click();

    // Confirm deletion
    cy.get('[data-cy="confirm-delete"]').click();

    // Verify success message
    cy.get('[data-cy="success-message"]').should('be.visible');
  });
}); 