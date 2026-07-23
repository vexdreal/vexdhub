import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { sendDiscordLog } from "@/lib/discord";
import { createActivity } from "@/lib/activity";

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

async function sendDiscordSafely(
  payload: Parameters<typeof sendDiscordLog>[0]
) {
  try {
    await sendDiscordLog(payload);
  } catch (error) {
    console.error("Discord log error:", error);
  }
}

// ========================
// GET SEMUA KEY
// ========================
export async function GET() {
  try {
    if (!(await isAdmin())) {
      return unauthorizedResponse();
    }

    const keys = await prisma.key.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(keys);
  } catch (error) {
    console.error("GET keys error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil daftar key",
      },
      {
        status: 500,
      }
    );
  }
}

// ========================
// CREATE KEY
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
      key?: unknown;
      duration?: unknown;
    };

    const newKey = String(
      requestBody.key ?? ""
    )
      .trim()
      .toUpperCase();

    const duration = String(
      requestBody.duration ?? "0"
    ).trim();

    if (!newKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Key kosong",
        },
        {
          status: 400,
        }
      );
    }

    if (
      newKey.length < 8 ||
      newKey.length > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Format key tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    let expiresAt: Date | null = null;

    if (duration !== "0") {
      const durationNumber = Number(duration);

      if (
        !Number.isInteger(durationNumber) ||
        durationNumber <= 0 ||
        durationNumber > 36500
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

      expiresAt = new Date();
      expiresAt.setDate(
        expiresAt.getDate() + durationNumber
      );
    }

    const key = await prisma.key.create({
      data: {
        key: newKey,
        expiresAt,
      },
    });

    await createActivity({
      action: "License generated",
      detail: key.key,
      tone: "success",
    });

    await sendDiscordSafely({
      title: "🔑 License Generated",
      color: 0x22c55e,
      fields: [
        {
          name: "Key",
          value: key.key,
          inline: false,
        },
        {
          name: "Durasi",
          value:
            duration === "0"
              ? "Permanen"
              : `${duration} Hari`,
          inline: true,
        },
        {
          name: "Expired",
          value: key.expiresAt
            ? key.expiresAt.toLocaleString(
                "id-ID"
              )
            : "Permanen",
          inline: true,
        },
      ],
    });

    return NextResponse.json(
      {
        success: true,
        message: "Key berhasil dibuat",
        data: key,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Key sudah tersedia di database",
        },
        {
          status: 409,
        }
      );
    }

    console.error("POST key error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat key",
      },
      {
        status: 500,
      }
    );
  }
}

// ========================
// DELETE KEY / RESET DEVICE
// ========================
export async function DELETE(req: Request) {
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
      id?: unknown;
      resetDevice?: unknown;
    };

    const id = Number(requestBody.id);
    const resetDevice =
      requestBody.resetDevice === true;

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    const existingKey =
      await prisma.key.findUnique({
        where: {
          id,
        },
      });

    if (!existingKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Key tidak ditemukan",
        },
        {
          status: 404,
        }
      );
    }

    // ========================
    // RESET DEVICE
    // ========================
    if (resetDevice) {
      const updatedKey =
        await prisma.key.update({
          where: {
            id,
          },
          data: {
            deviceId: null,
            lastUsed: null,
            useCount: 0,
          },
        });

      await createActivity({
        action: "Device reset",
        detail: existingKey.key,
        tone: "info",
      });

      await sendDiscordSafely({
        title: "🔄 Device Reset",
        color: 0x3b82f6,
        fields: [
          {
            name: "Key",
            value: existingKey.key,
            inline: false,
          },
          {
            name: "License ID",
            value: String(id),
            inline: true,
          },
        ],
      });

      return NextResponse.json({
        success: true,
        message: "Device berhasil direset",
        data: updatedKey,
      });
    }

    // ========================
    // HAPUS KEY PERMANEN
    // ========================
    await prisma.key.delete({
      where: {
        id,
      },
    });

    await createActivity({
      action: "License deleted",
      detail: existingKey.key,
      tone: "warning",
    });

    await sendDiscordSafely({
      title: "🗑️ License Deleted",
      color: 0xef4444,
      fields: [
        {
          name: "Key",
          value: existingKey.key,
          inline: false,
        },
        {
          name: "License ID",
          value: String(id),
          inline: true,
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Key berhasil dihapus",
    });
  } catch (error) {
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Key tidak ditemukan",
        },
        {
          status: 404,
        }
      );
    }

    console.error("DELETE key error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Terjadi kesalahan pada server",
      },
      {
        status: 500,
      }
    );
  }
}