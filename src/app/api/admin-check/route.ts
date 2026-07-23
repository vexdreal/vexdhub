import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await isAdmin();

    return NextResponse.json({
      success: admin,
    });
  } catch (error) {
    console.error("Admin check error:", error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}