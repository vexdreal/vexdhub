import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (typeof body.password !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Request tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error(
        "ADMIN_PASSWORD tidak ditemukan di environment variables."
      );

      return NextResponse.json(
        {
          success: false,
          message: "Konfigurasi server belum lengkap",
        },
        {
          status: 500,
        }
      );
    }

    if (body.password === adminPassword) {
      const response = NextResponse.json({
        success: true,
        message: "Login berhasil",
      });

      response.cookies.set(
        "admin_session",
        "authenticated",
        {
          httpOnly: true,
          secure:
            process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24,
          path: "/",
        }
      );

      return response;
    }

    return NextResponse.json(
      {
        success: false,
        message: "Password salah",
      },
      {
        status: 401,
      }
    );
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Request tidak valid",
      },
      {
        status: 400,
      }
    );
  }
}