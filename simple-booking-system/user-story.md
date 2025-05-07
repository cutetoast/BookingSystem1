**Title**: Online Appointment Booking

**As a** Customer
**I want** to book appointments online
**So that** I can easily schedule appointments at my convenience without having to call or email.

**Business Logic**:
- Bookings should not overlap.
- A confirmation email is sent to the customer only after admin approval.
- Cancellations are allowed up to 24 hours before the appointment time.
- Booking requests must be approved by an admin before they are confirmed.
- The admin appointment list page includes an approval status column (Pending/Approved).
- A user can make a maximum of 3 bookings per day.
- The system does not allow selecting a past date/time for a new booking.
- Users can view their past booking history.
- If a booking request is rejected, the user must wait 15 minutes before trying again for the same time slot.
- Unconfirmed bookings are auto-cancelled if the admin doesn't approve them within 2 hours.
- The system automatically sends a reminder email to the user exactly 24 hours before their approved appointment time, including appointment details, service name, location, and cancellation instructions. Email retries occur hourly up to three times if the initial send fails.

**Acceptance Criteria**:
1. Users can view available time slots for a given service.
2. Users can select a time slot and submit a booking request.
3. Users receive a confirmation email only after their booking is approved by an admin.
4. The system prevents double-booking of time slots.
5. The system handles invalid input gracefully.
6. Users can cancel appointments up to 24 hours in advance.
7. The admin appointment list displays the approval status of each booking request (Pending/Approved).
8. The system prevents users from booking more than 3 appointments per day.
9. Users can view their past booking history.
10. The system prevents a user from immediately re-booking a rejected time slot (enforces a 15-minute waiting period).
11. The system automatically cancels unconfirmed bookings after 2 hours.
12. Users receive a reminder email 24 hours before their appointment with appointment details, service name, location, and cancellation instructions.

**Functional Requirements**:
- View available time slots.
- Submit a booking request.
- Receive booking confirmation (email).
- Cancel an appointment.
- Manage appointment details (date, time, service).
- Search for available appointments based on criteria (date, service).
- Admin can approve or reject booking requests.
- Admin can view the list of appointments with their approval status.
- User can view past booking history.
- Support light and dark themes.
- Send reminder emails.

**Non-Functional Requirements**:
- The system should be user-friendly and easy to navigate.
- The system should be secure and protect user data.
- The system should be performant and respond quickly to user requests.
- The system should be reliable and available 24/7.
- The system should handle email sending failures gracefully with retries.

**UI Design**:
- A calendar view to display available time slots.
- A clear and concise booking form.
- A confirmation page after successful booking.
- A user account section to manage bookings.
- An admin panel to manage appointment requests and their approval status.
- Responsive design for various screen sizes.
- Theme switcher (light/dark mode).
