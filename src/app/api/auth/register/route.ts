import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { db } from "@/lib/db";
import { signUpSchema } from "@/lib/validations/auth";

// This file only runs on the server, so it's safe to use bcrypt here
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = signUpSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid request data", 
          errors: result.error.errors 
        },
        { status: 400 }
      );
    }
    
    const { name, email, password } = result.data;
    
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: "User with this email already exists" 
        },
        { status: 409 }
      );
    }
    
    // Hash password (safe to use bcrypt here as this code only runs on the server)
    const hashedPassword = await hash(password, 10);
    
    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    
    return NextResponse.json(
      { 
        success: true,
        message: "User created successfully",
        user: { 
          id: user.id,
          name: user.name,
          email: user.email 
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Something went wrong" 
      },
      { status: 500 }
    );
  }
} 