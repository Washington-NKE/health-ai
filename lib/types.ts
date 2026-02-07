export type UserRole = "patient" | "doctor" | "admin" | "staff"

export interface User {
  id: string
  email: string
  phone?: string
  role: UserRole
  isActive: boolean
  createdAt: Date
}

export interface Patient {
  id: string
  userId: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  gender?: string
  bloodType?: string
  address?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  insuranceProvider?: string
  insurancePolicyNumber?: string
}

export interface Doctor {
  id: string
  userId: string
  firstName: string
  lastName: string
  specialization: string
  licenseNumber: string
  department?: string
  consultationFee?: number
  bio?: string
}

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  appointmentDate: string
  appointmentTime: string
  durationMinutes: number
  status: "scheduled" | "confirmed" | "cancelled" | "completed" | "no_show"
  reason?: string
  notes?: string
  patient?: Patient
  doctor?: Doctor
}

export interface Prescription {
  id: string
  patientId: string
  doctorId: string
  appointmentId?: string
  medicationName: string
  dosage: string
  frequency: string
  duration?: string
  instructions?: string
  startDate: string
  endDate?: string
  status: "active" | "completed" | "cancelled"
  doctor?: Doctor
}

export interface LabResult {
  id: string
  patientId: string
  doctorId?: string
  testName: string
  testDate: string
  resultValue?: string
  unit?: string
  referenceRange?: string
  status: "pending" | "completed" | "reviewed"
  notes?: string
  fileUrl?: string
}

export interface Bill {
  id: string
  patientId: string
  appointmentId?: string
  totalAmount: number
  paidAmount: number
  status: "pending" | "paid" | "partially_paid" | "overdue" | "cancelled"
  dueDate?: string
  paymentMethod?: string
  items: BillItem[]
}

export interface BillItem {
  id: string
  billId: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Message {
  id: string
  conversationId: string
  senderType: "user" | "assistant" | "system"
  content: string
  metadata?: Record<string, any>
  createdAt: Date
}

export interface Conversation {
  id: string
  userId: string
  channel: "web" | "mobile" | "whatsapp" | "sms"
  status: "active" | "closed"
  createdAt: Date
  updatedAt: Date
}
