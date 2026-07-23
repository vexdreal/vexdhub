import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { createActivity } from "@/lib/activity";
import { sendDiscordLog } from "@/lib/discord";

function createLicenseKey() {
  const random = crypto
    .randomUUID()
    .replaceAll("-", "")
    .slice(0, 10)
    .toUpperCase();

  return `VEXD-${random}`;
}

function unauthorizedResponse() {
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

async function sendDiscordSafely(
  payload: Parameters<typeof sendDiscordLog>[0]
) {
  try {
    await sendDiscordLog(payload);
  } catch (error) {
    console.error("Discord batch log error:", error);
  }
}

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
      amount?: unknown;
      duration?: unknown;
    };

    const amount = Number(requestBody.amount);
    const duration = Number(
      requestBody.duration ?? 0
    );

    if (
      !Number.isInteger(amount) ||
      amount < 1 ||
      amount > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Jumlah key harus antara 1 sampai 100",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(duration) ||
      duration < 0 ||
      duration > 36500
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

    // Set mencegah duplikat di dalam batch yang sama.
    const generatedKeys = new Set<string>();

    while (generatedKeys.size < amount) {
      generatedKeys.add(createLicenseKey());
    }

    const keyData = Array.from(
      generatedKeys,
      (key) => ({
        key,
        expiresAt,
      })
    );

    const result = await prisma.key.createMany({
      data: keyData,
      skipDuplicates: true,
    });

    // Ambil kembali hanya key yang benar-benar ada di database.
    const createdKeys = await prisma.key.findMany({
      where: {
        key: {
          in: keyData.map((item) => item.key),
        },
      },
      select: {
        id: true,
        key: true,
        active: true,
        expiresAt: true,
        deviceId: true,
        lastUsed: true,
        useCount: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    await createActivity({
      action: "Batch licenses generated",
      detail: `${createdKeys.length} license dibuat`,
      tone: "success",
    });

    await sendDiscordSafely({
      title: "📦 Batch Licenses Generated",
      color: 0xef4444,
      fields: [
        {
          name: "Jumlah",
          value: String(createdKeys.length),
          inline: true,
        },
        {
          name: "Durasi",
          value:
            duration === 0
              ? "Permanen"
              : `${duration} Hari`,
          inline: true,
        },
        {
          name: "Expired",
          value: expiresAt
            ? expiresAt.toLocaleString("id-ID")
            : "Permanen",
          inline: true,
        },
      ],
    });

    return NextResponse.json(
      {
        success: true,
        message: `${createdKeys.length} key berhasil dibuat`,
        count: createdKeys.length,
        keys: createdKeys.map(
          (item) => item.key
        ),
        data: createdKeys,
        requested: amount,
        skipped:
          amount - result.count,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Batch generate error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Terjadi kesalahan saat membuat key",
      },
      {
        status: 500,
      }
    );
  }
}