import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

function createLicenseKey() {
  const random = crypto
    .randomUUID()
    .replaceAll("-", "")
    .slice(0, 10)
    .toUpperCase();

  return `VEXD-${random}`;
}

export async function POST(req: Request) {
  try {
    const admin = await isAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Tidak memiliki akses admin",
        },
        {
          status: 401,
        }
      );
    }

    const body = await req.json();

    const amount = Number(body.amount);
    const duration = Number(body.duration);

    if (
      !Number.isInteger(amount) ||
      amount < 1 ||
      amount > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Jumlah key harus antara 1 sampai 100",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(duration) ||
      duration < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Durasi tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    let expiresAt: Date | null = null;

    if (duration > 0) {
      expiresAt = new Date();
      expiresAt.setDate(
        expiresAt.getDate() + duration
      );
    }

    const keyData = Array.from(
      { length: amount },
      () => ({
        key: createLicenseKey(),
        expiresAt,
      })
    );

    const result = await prisma.key.createMany({
      data: keyData,
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} key berhasil dibuat`,
      count: result.count,
      keys: keyData.map((item) => item.key),
    });
  } catch (error) {
    console.error("Batch generate error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat membuat key",
      },
      {
        status: 500,
      }
    );
  }
}