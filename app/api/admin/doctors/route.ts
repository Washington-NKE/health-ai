import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const doctors = await prisma.doctor.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            isActive: true,
          },
        },
      },
      where: search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { specialization: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { lastName: "asc" },
    });

    return NextResponse.json({ doctors });
  } catch (error) {
    console.error("Doctors GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      firstName,
      lastName,
      phone,
      specialization,
      licenseNumber,
      department,
      consultationFee,
      bio,
      password,
    } = body;

    // Validate required fields
    if (!email || !firstName || !lastName || !password || !specialization) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user and doctor in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          firstName,
          lastName,
          phone: phone || undefined,
          password: hashedPassword,
          role: "doctor",
          isActive: true,
        },
      });

      const doctor = await tx.doctor.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          specialization,
          licenseNumber: licenseNumber || "",
          department: department || "",
          consultationFee: consultationFee ? parseFloat(consultationFee) : 50,
          bio: bio || "",
          isAvailable: true,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              isActive: true,
            },
          },
        },
      });

      return doctor;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Doctors POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
