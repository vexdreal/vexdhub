import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

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

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return unauthorizedResponse();
    }

    const now = new Date();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalLicense,
      activeLicense,
      expiredLicense,
      registeredDevice,
      todayGenerated,
      totalUse,
    ] = await Promise.all([
      prisma.key.count(),

      prisma.key.count({
        where: {
          active: true,
          OR: [
            {
              expiresAt: null,
            },
            {
              expiresAt: {
                gte: now,
              },
            },
          ],
        },
      }),

      prisma.key.count({
        where: {
          expiresAt: {
            lt: now,
          },
        },
      }),

      prisma.key.count({
        where: {
          deviceId: {
            not: null,
          },
        },
      }),

      prisma.key.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),

      prisma.key.aggregate({
        _sum: {
          useCount: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalLicense,
        activeLicense,
        expiredLicense,
        registeredDevice,
        todayGenerated,
        totalActivation:
          totalUse._sum.useCount ?? 0,
      },
    });
  } catch (error) {
    console.error(
      "Dashboard API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Dashboard gagal dimuat",
      },
      {
        status: 500,
      }
    );
  }
}