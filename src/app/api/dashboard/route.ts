import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
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
        totalActivation: totalUse._sum.useCount ?? 0,
      },
    });
  } catch (error) {
    console.error(error);

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