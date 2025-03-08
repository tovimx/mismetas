import { NextResponse } from "next/server";
import { compare } from "bcrypt";
import { z } from "zod";

// Password verification schema
const verifyPasswordSchema = z.object({
  plainPassword: z.string(),
  hashedPassword: z.string()
});

// This file only runs on the server, so it's safe to use bcrypt here
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = verifyPasswordSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid request data"
        },
        { status: 400 }
      );
    }
    
    const { plainPassword, hashedPassword } = result.data;
    
    // Verify password
    const isValid = await compare(plainPassword, hashedPassword);
    
    return NextResponse.json({ success: true, isValid });
  } catch (error) {
    console.error("Error verifying password:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Something went wrong"
      },
      { status: 500 }
    );
  }
} 