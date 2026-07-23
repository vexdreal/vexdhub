import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { createActivity } from "@/lib/activity";
import { sendDiscordLog } from "@/lib/discord";

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
    console.error("Discord toggle log error:", error);
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
      id?: unknown;
    };

    const id = Number(requestBody.id);

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

    const key = await prisma.key.findUnique({
      where: {
        id,
      },
    });

    if (!key) {
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

    const updated = await prisma.key.update({
      where: {
        id,
      },
      data: {
        active: !key.active,
      },
    });

    const statusLabel = updated.active
      ? "Active"
      : "Nonaktif";

    await createActivity({
      action: "License status changed",
      detail: `${updated.key} → ${statusLabel}`,
      tone: "info",
    });

    await sendDiscordSafely({
      title: updated.active
        ? "✅ License Activated"
        : "⛔ License Disabled",
      color: updated.active
        ? 0x22c55e
        : 0xef4444,
      fields: [
        {
          name: "Key",
          value: updated.key,
          inline: false,
        },
        {
          name: "Status",
          value: statusLabel,
          inline: true,
        },
        {
          name: "License ID",
          value: String(updated.id),
          inline: true,
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message: `Status key berhasil diubah menjadi ${statusLabel}`,
      data: updated,
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

    console.error("Toggle key error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengubah status key",
      },
      {
        status: 500,
      }
    );
  }
}