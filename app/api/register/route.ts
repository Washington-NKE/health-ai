import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      role = "patient",
      firstName,
      lastName,
      dateOfBirth,
      phone,
    } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 },
      );
    }

    // Use bcrypt to hash passwords
    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        role,
        phone: phone || null,
        isActive: true,
        patient:
          role === "patient"
            ? {
                create: {
                  firstName: firstName || "User",
                  lastName: lastName || "Account",
                  dateOfBirth: dateOfBirth
                    ? new Date(dateOfBirth)
                    : new Date("2000-01-01"),
                },
              }
            : undefined,
      },
      include: { patient: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error?.message || "Registration failed. Please try again." },
      { status: 400 },
    );
  }
}
