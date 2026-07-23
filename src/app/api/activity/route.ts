import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

type ActivityTone =
  | "success"
  | "info"
  | "warning";

function unauthorizedResponse() {
  return NextResponse.json(
    {
      success: false,
      message: "Akses ditolak",
    },
    {
      status: 401,
    }
  );
}

function isValidTone(
  value: string
): value is ActivityTone {
  return (
    value === "success" ||
    value === "info" ||
    value === "warning"
  );
}

// ========================
// GET ACTIVITY HISTORY
// ========================
export async function GET() {
  try {
    if (!(await isAdmin())) {
      return unauthorizedResponse();
    }

    const activities =
      await prisma.activity.findMany({
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
    console.error(
      "GET activity error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Gagal mengambil activity history",
      },
      {
        status: 500,
      }
    );
  }
}

// ========================
// CREATE ACTIVITY
// ========================
export async function POST(req: Request) {
  try {
    if (!(await isAdmin())) {
      return unauthorizedResponse();
    }

    const body: unknown = await req.json();

    if (
      typeof body !== "object" ||
      body === null
    ) {
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

    const requestBody = body as {
      action?: unknown;
      detail?: unknown;
      tone?: unknown;
    };

    const action = String(
      requestBody.action ?? ""
    ).trim();

    const detail = String(
      requestBody.detail ?? ""
    ).trim();

    const rawTone = String(
      requestBody.tone ?? "info"
    ).trim();

    if (!action || !detail) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Action dan detail wajib diisi",
        },
        {
          status: 400,
        }
      );
    }

    if (
      action.length > 100 ||
      detail.length > 500
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Action atau detail terlalu panjang",
        },
        {
          status: 400,
        }
      );
    }

    if (!isValidTone(rawTone)) {
      return NextResponse.json(
        {
          success: false,
          message: "Tone tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    const activity =
      await prisma.activity.create({
        data: {
          action,
          detail,
          tone: rawTone,
        },
      });

    return NextResponse.json(
      {
        success: true,
        activity,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST activity error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Gagal menyimpan activity",
      },
      {
        status: 500,
      }
    );
  }
}