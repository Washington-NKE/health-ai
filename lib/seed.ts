import { UserRole, BillingStatus, AppointmentStatus } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'


async function main() {
  console.log('🌱 Starting database seed...')

  // 1. CLEANUP: Delete existing data to prevent conflicts (Order matters!)
  await prisma.availability.deleteMany()
  await prisma.labResult.deleteMany()
  await prisma.prescription.deleteMany()
  await prisma.billing.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.doctor.deleteMany()
  await prisma.staff.deleteMany()
  await prisma.hospital.deleteMany()
  await prisma.user.deleteMany()

  // Standard password for everyone: "Health123!"
  const hashedPassword = await bcrypt.hash('Health123!', 10)

  // 2. CREATE HOSPITAL (US Context)
  const hospital = await prisma.hospital.create({
    data: {
      name: 'Metropolitan General Medical Center',
      address: '1001 Healthcare Blvd, Suite 500, New York, NY 10001',
      phone: '(212) 555-0199',
      email: 'contact@metropolitan-general.com',
      website: 'www.metropolitan-general.com',
      departments: ['Cardiology', 'Primary Care', 'Pediatrics', 'Emergency'],
    },
  })
  console.log(`🏥 Created Hospital: ${hospital.name}`)

  // 3. CREATE DOCTORS
  // Doctor 1: Primary Care
  const docUser1 = await prisma.user.create({
    data: {
      email: 'dr.smith@metro.com',
      password: hashedPassword,
      role: 'doctor',
      doctor: {
        create: {
          firstName: 'James',
          lastName: 'Smith',
          specialization: 'Internal Medicine',
          licenseNumber: 'NY-448291',
          consultationFee: 150.00,
          bio: 'Board-certified Internist with 15 years of experience in preventative care and chronic disease management.',
          verified: true,
          hospital: {
            connect: { id: hospital.id }
          },
          availability: {
            create: [
              { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
              { dayOfWeek: 1, startTime: '14:00', endTime: '17:00' },
              { dayOfWeek: 3, startTime: '09:00', endTime: '12:00' },
            ]
          }
        },
      },
    },
    include: { doctor: true }
  })

  // Doctor 2: Specialist
  const docUser2 = await prisma.user.create({
    data: {
      email: 'dr.lee@metro.com',
      password: hashedPassword,
      role: 'doctor',
      doctor: {
        create: {
          firstName: 'Sarah',
          lastName: 'Lee',
          specialization: 'Cardiology',
          licenseNumber: 'NY-992102',
          consultationFee: 250.00,
          bio: 'Specialist in cardiovascular health, hypertension, and heart rhythm disorders.',
          verified: true,
          hospital: {
            connect: { id: hospital.id }
          },
          availability: {
            create: [
              { dayOfWeek: 2, startTime: '10:00', endTime: '16:00' },
              { dayOfWeek: 4, startTime: '10:00', endTime: '16:00' },
            ]
          }
        },
      },
    },
    include: { doctor: true }
  })
  
  console.log(`👨‍⚕️ Created 2 Doctors`)

  // 4. CREATE PATIENT (The Demo User)
  const patientUser = await prisma.user.create({
    data: {
      email: 'patient@demo.com', // LOGIN WITH THIS
      password: hashedPassword,  // PASSWORD: Health123!
      role: 'patient',
      phone: '(555) 123-4567',
      patient: {
        create: {
          firstName: 'Michael',
          lastName: 'Anderson',
          dateOfBirth: new Date('1985-06-15'),
          gender: 'Male',
          bloodType: 'O+',
          address: '452 Park Avenue, Apt 4B, New York, NY 10022',
          emergencyContactName: 'Jennifer Anderson',
          emergencyContactPhone: '(555) 987-6543',
          insuranceProvider: 'Blue Cross Blue Shield',
          insurancePolicyNumber: 'BCBS-88429110',
        },
      },
    },
    include: { patient: true }
  })

  const patientId = patientUser.patient[0].id
  const doc1Id = docUser1.doctor[0].id
  const doc2Id = docUser2.doctor[0].id

  console.log(`👤 Created Patient: ${patientUser.email}`)

  // 5. SEED HISTORY (Data for the AI to Fetch)

  // Past Appointment (Completed)
  await prisma.appointment.create({
    data: {
      patientId: patientId,
      doctorId: doc1Id, // Dr. Smith
      appointmentDate: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
      durationMinutes: 30,
      status: AppointmentStatus.completed,
      reason: 'Annual Physical Examination',
      notes: 'Patient is in good health. BP 120/80.',
    }
  })

  // Upcoming Appointment (Scheduled)
  await prisma.appointment.create({
    data: {
      patientId: patientId,
      doctorId: doc2Id, // Dr. Lee
      appointmentDate: new Date(new Date().setDate(new Date().getDate() + 5)), // In 5 days
      durationMinutes: 45,
      status: AppointmentStatus.scheduled,
      reason: 'Follow-up on heart palpitations',
    }
  })

  // Prescriptions (FDA standard drugs)
  await prisma.prescription.createMany({
    data: [
      {
        patientId: patientId,
        doctorId: doc1Id,
        medication: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        instructions: 'Take with food in the morning',
        expiresAt: new Date(new Date().setDate(new Date().getDate() + 90)),
      },
      {
        patientId: patientId,
        doctorId: doc2Id,
        medication: 'Atorvastatin',
        dosage: '20mg',
        frequency: 'Once daily at bedtime',
        instructions: 'Avoid grapefruit juice while taking this medication',
        expiresAt: new Date(new Date().setDate(new Date().getDate() + 60)),
      }
    ]
  })

  // Billing (US Healthcare costs)
  await prisma.billing.create({
    data: {
      patientId: patientId,
      amount: 45.00, // Typical Co-pay
      currency: 'USD',
      status: BillingStatus.pending,
      description: 'Co-pay for Office Visit (09/15/2025)',
    }
  })
  
  await prisma.billing.create({
    data: {
      patientId: patientId,
      amount: 150.00,
      currency: 'USD',
      status: BillingStatus.paid,
      description: 'Lab Work - Lipid Panel',
      paidAt: new Date()
    }
  })

  // Lab Results
  await prisma.labResult.create({
    data: {
      patientId: patientId,
      doctorId: doc1Id,
      type: 'Lipid Panel',
      result: 'Total Cholesterol: 190 mg/dL',
      units: 'mg/dL',
      referenceRange: '< 200 mg/dL',
      collectedAt: new Date(new Date().setDate(new Date().getDate() - 2)),
      labNotes: 'Within normal range.',
    }
  })

  console.log('✅ Seed completed successfully!')
  console.log('----------------------------------------')
  console.log('🔑 Login Credentials:')
  console.log('   Email:    patient@demo.com')
  console.log('   Password: Health123!')
  console.log('----------------------------------------')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

