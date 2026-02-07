# AI Chatbot Agent for Hospital Systems — Database Schema

##  Project Overview

This system powers an **AI Chatbot Agent for hospitals** that can perform real tasks for users such as:
- Booking doctor appointments  
- Fetching billing and prescription data  
- Managing patient records  
- Handling user queries and communication  

The database is designed to support automation, secure access, and real-time updates.

---

## Database Schema Overview

The hospital chatbot database consists of **8 main entities**:
1. **Users**  
2. **Patients**  
3. **Doctors**  
4. **Appointments**  
5. **Prescriptions**  
6. **Bills**  
7. **Messages / Conversations**  
8. **AI Actions & Logs**

---

## Entity Descriptions and Relationships

### 1. Users Table
Stores general user accounts for both patients and doctors.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| name | String | Full name of the user |
| email | String | Login email address |
| password | String (hashed) | Securely stored password |
| role | Enum(`patient`, `doctor`, `admin`) | User role |
| created_at | Timestamp | Account creation date |

**Relationships**
- `Users.id` → links to `Patients.user_id` or `Doctors.user_id`

---

###  2. Patients Table

| Field | Type | Description |
|--------|------|-------------|
| id | UUID | Unique patient identifier |
| user_id | UUID | FK to `Users.id` |
| national_id | String | Patient national ID |
| date_of_birth | Date | Patient’s date of birth |
| gender | String | Male/Female/Other |
| address | String | Residential address |
| phone_number | String | Contact number |
| emergency_contact | String | Emergency contact name & phone |

**Relationships**
- One-to-One → `Users`
- One-to-Many → `Appointments`, `Bills`, `Prescriptions`

---

###  3. Doctors Table

| Field | Type | Description |
|--------|------|-------------|
| id | UUID | Unique doctor identifier |
| user_id | UUID | FK to `Users.id` |
| specialization | String | Field of specialization (e.g., cardiology) |
| license_number | String | Medical registration number |
| hospital_branch | String | Branch where the doctor works |

**Relationships**
- One-to-One → `Users`
- One-to-Many → `Appointments`, `Prescriptions`

---

### 4. Appointments Table

| Field | Type | Description |
|--------|------|-------------|
| id | UUID | Appointment identifier |
| patient_id | UUID | FK to `Patients.id` |
| doctor_id | UUID | FK to `Doctors.id` |
| appointment_date | DateTime | Date and time |
| status | Enum(`pending`, `confirmed`, `cancelled`, `completed`) | Appointment state |
| notes | Text | AI or doctor remarks |

**Relationships**
- Many-to-One → `Patients`
- Many-to-One → `Doctors`
- Optional → `Messages` (AI conversation related to booking)

---

### 5. Prescriptions Table

| Field | Type | Description |
|--------|------|-------------|
| id | UUID | Prescription ID |
| appointment_id | UUID | FK to `Appointments.id` |
| doctor_id | UUID | FK to `Doctors.id` |
| patient_id | UUID | FK to `Patients.id` |
| medication | JSON | List of drugs and dosage |
| issued_date | Date | When prescription was issued |

---

### 💵 6. Bills Table

| Field | Type | Description |
|--------|------|-------------|
| id | UUID | Bill identifier |
| patient_id | UUID | FK to `Patients.id` |
| appointment_id | UUID | FK to `Appointments.id` |
| total_amount | Decimal | Total charge |
| payment_method | Enum(`mpesa`, `card`, `cash`) | Payment mode |
| payment_status | Enum(`pending`, `paid`, `failed`) | Status of payment |
| created_at | Timestamp | Created date |

---

### 7. Messages / Conversations Table

| Field | Type | Description |
|--------|------|-------------|
| id | UUID | Message ID |
| user_id | UUID | FK to `Users.id` |
| ai_agent_id | UUID | Reference to AI agent logic |
| message_text | Text | Message content |
| sender | Enum(`user`, `ai`) | Who sent the message |
| created_at | Timestamp | Time sent |
| context_ref | String | Related appointment, billing, or prescription ID |

**Usage**
- Tracks AI-patient-doctor communication  
- Enables chatbot memory and conversation history

---

### 8. AI Actions & Logs Table

| Field | Type | Description |
|--------|------|-------------|
| id | UUID | Action log ID |
| user_id | UUID | FK to `Users.id` |
| action_type | String | e.g. “schedule_appointment”, “fetch_bill” |
| input_prompt | Text | User query |
| ai_decision | JSON | AI’s structured action plan |
| result_status | Enum(`success`, `failed`) | Result of action |
| timestamp | Timestamp | Logged at |


