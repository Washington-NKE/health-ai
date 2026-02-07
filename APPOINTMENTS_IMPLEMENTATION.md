# Appointments System Implementation

## Overview

Complete CRUD functionality for appointment booking, management, and scheduling has been implemented with full database integration.

## Database Schema

Uses Prisma `Appointment` model with the following structure:

```typescript
model Appointment {
  id              String            @id @default(cuid())
  patientId       String
  doctorId        String
  appointmentDate DateTime
  durationMinutes Int
  status          AppointmentStatus @default(pending)
  reason          String?
  notes           String?
  patient         Patient?          @relation(fields: [patientId], references: [id])
  doctor          Doctor?           @relation(fields: [doctorId], references: [id])
}

enum AppointmentStatus {
  pending
  scheduled
  confirmed
  cancelled
  completed
  no_show
}
```

## API Endpoints

### GET /api/appointments

Retrieve appointments with role-based filtering.

**Query Parameters:**

- `role` (optional): 'patient', 'doctor', 'admin', 'staff'
- `userId` (optional): User ID for filtering
- `status` (optional): Filter by appointment status

**Response:**

```json
{
  "appointments": [
    {
      "id": "cuid",
      "patientId": "patient-id",
      "doctorId": "doctor-id",
      "appointmentDate": "2026-02-10T14:30:00Z",
      "durationMinutes": 30,
      "status": "pending",
      "reason": "Regular checkup",
      "notes": "Patient has insurance",
      "patient": { ... },
      "doctor": { ... }
    }
  ]
}
```

### POST /api/appointments

Create a new appointment.

**Request Body:**

```json
{
  "doctorId": "doctor-id",
  "appointmentDate": "2026-02-10T14:30:00Z",
  "durationMinutes": 30,
  "reason": "Regular checkup",
  "notes": "Additional information"
}
```

### GET /api/appointments/:id

Retrieve a specific appointment.

### PATCH /api/appointments/:id

Update appointment status or notes.

**Request Body:**

```json
{
  "status": "confirmed",
  "notes": "Updated notes"
}
```

### DELETE /api/appointments/:id

Cancel/delete an appointment.

## Frontend Pages

### 1. Patient Appointments List (`/appointments`)

- View all personal appointments
- Filter by status (pending, scheduled, confirmed, completed, cancelled)
- Cancel pending/scheduled appointments
- Navigate to book new appointment

**Features:**

- Real-time status display with color-coded badges
- Date/time formatting
- Duration display
- Reason display

### 2. Book Appointment (`/appointments/book`)

- Browse available doctors with specialization
- Select appointment date and time
- Choose duration (15, 30, 45, 60 minutes)
- Add reason for visit and additional notes
- Form validation
- Success confirmation with auto-redirect

**Form Fields:**

- Doctor selection (required)
- Appointment date (required, future dates only)
- Appointment time (required)
- Duration (default 30 minutes)
- Reason (optional)
- Additional notes (optional)

### 3. Doctor Schedule (`/app/doctor/schedule`)

- View all scheduled appointments
- Filter by status
- Update appointment status
- See patient details and appointment reason

**Capabilities:**

- Change status to: pending, confirmed, completed, cancelled, no_show
- View patient information
- See appointment duration
- Track reason for visit

### 4. Admin Appointments (`/app/admin/appointments`)

- Search appointments by patient or doctor name
- Filter by status
- Update appointment status
- Delete appointments

**Search Features:**

- Patient first/last name
- Doctor first/last name
- Status filtering
- Real-time updates

## Role-Based Access Control

### Patient

- View own appointments
- Book new appointments
- Cancel pending/scheduled appointments

### Doctor

- View own appointments
- Update appointment status
- View patient details

### Admin/Staff

- View all appointments
- Update appointment status
- Search and filter appointments
- Delete appointments

## Key Features Implemented

### 1. Authentication & Authorization

- NextAuth session integration
- Role-based route protection
- User identification via userId

### 2. Form Handling

- Client-side form validation
- Error handling with user feedback
- Success confirmation messages
- Auto-redirect after booking

### 3. Data Management

- Real-time list updates
- Status filtering
- Search functionality
- Sorting by date

### 4. UI/UX

- Responsive design (mobile-friendly)
- Status color coding
- Loading states
- Empty state messages
- Error notifications

## Database Queries

The implementation uses efficient Prisma queries:

- Select specific fields to reduce payload
- Include relationships (patient, doctor)
- Filter with where clauses
- Sort by appointmentDate

## Error Handling

- Unauthorized access (401)
- Missing fields validation (400)
- Resource not found (404)
- Internal server errors (500)
- User-friendly error messages

## Future Enhancements

1. **Availability Calendar**: Show doctor availability slots
2. **Notifications**: Email/SMS reminders for appointments
3. **Ratings/Reviews**: Patient feedback on appointments
4. **Rescheduling**: Change appointment time/date
5. **Video Consultations**: Integration for virtual appointments
6. **Invoice Generation**: Auto-generate bills post-appointment
7. **Recurring Appointments**: Set up recurring check-ups
8. **Calendar Integration**: Sync with Google/Outlook calendars

## Testing Checklist

- [ ] Patient can book appointment
- [ ] Doctor can view appointments
- [ ] Admin can manage all appointments
- [ ] Status changes work correctly
- [ ] Cancellations work properly
- [ ] Date/time formatting displays correctly
- [ ] Unauthorized access is blocked
- [ ] Empty states display correctly
- [ ] Search filtering works
- [ ] Error messages display properly
