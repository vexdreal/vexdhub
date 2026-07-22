import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendDiscordLog } from "@/lib/discord";

// GET SEMUA KEY
export async function GET() {
  try {
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

// CREATE KEY
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newKey = body.key;
    const duration = body.duration;

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

    let expiresAt: Date | null = null;

    if (duration && duration !== "0") {
      const date = new Date();

      date.setDate(
        date.getDate() + Number(duration)
      );

      expiresAt = date;
    }

    const key = await prisma.key.create({
      data: {
        key: newKey,
        expiresAt,
      },
    });

    await sendDiscordLog({
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
            ? key.expiresAt.toLocaleString("id-ID")
            : "Permanen",
          inline: true,
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Key berhasil dibuat",
      data: key,
    });
  } catch (error) {
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

// DELETE KEY / RESET DEVICE
export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    const id = Number(body.id);
    const resetDevice = Boolean(body.resetDevice);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID tidak ditemukan",
        },
        {
          status: 400,
        }
      );
    }

    const existingKey = await prisma.key.findUnique({
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

    // RESET DEVICE
    if (resetDevice) {
      const updatedKey = await prisma.key.update({
        where: {
          id,
        },
        data: {
          deviceId: null,
          lastUsed: null,
          useCount: 0,
        },
      });

      await sendDiscordLog({
        title: "🔄 Device Reset",
        color: 0x3b82f6,
        fields: [
          {
            name: "Key",
            value: updatedKey.key,
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

    // HAPUS KEY PERMANEN
    await prisma.key.delete({
      where: {
        id,
      },
    });

    await sendDiscordLog({
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
    console.error("DELETE key error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      {
        status: 500,
      }
    );
  }
}