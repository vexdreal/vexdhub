import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      activities,
    });
  } catch (error) {
    console.error("GET activity error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil activity history",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const action = String(body.action ?? "").trim();
    const detail = String(body.detail ?? "").trim();
    const tone = String(body.tone ?? "info").trim();

    if (!action || !detail) {
      return NextResponse.json(
        {
          success: false,
          message: "Action dan detail wajib diisi",
        },
        {
          status: 400,
        }
      );
    }

    const activity = await prisma.activity.create({
      data: {
        action,
        detail,
        tone,
      },
    });

    return NextResponse.json({
      success: true,
      activity,
    });
  } catch (error) {
    console.error("POST activity error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menyimpan activity",
      },
      {
        status: 500,
      }
    );
  }
}