import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    const where = role && role !== "all" ? { role: role as any } : {};

    const users = await prisma.user.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            gender: true,
            bloodType: true,
            address: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
            department: true,
            consultationFee: true,
            licenseNumber: true,
          },
        },
        staff: {
          select: {
            id: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, phone, role, firstName, lastName, ...extraData } =
      body;

    // Validate required fields
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, and role are required" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with role-specific data
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        phone,
        role,
      },
    });

    // Create role-specific records
    if (role === "patient" && firstName && lastName) {
      await prisma.patient.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          dateOfBirth: extraData.dateOfBirth
            ? new Date(extraData.dateOfBirth)
            : new Date(),
          gender: extraData.gender,
          bloodType: extraData.bloodType,
          address: extraData.address,
        },
      });
    } else if (role === "doctor" && firstName && lastName) {
      await prisma.doctor.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          specialization: extraData.specialization || "General",
          licenseNumber: extraData.licenseNumber || `LIC-${Date.now()}`,
          department: extraData.department,
          consultationFee: extraData.consultationFee,
        },
      });
    } else if (role === "staff") {
      await prisma.staff.create({
        data: {
          userId: user.id,
          role: extraData.staffRole || "receptionist",
        },
      });
    }

    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
