import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const userKey = body.key;

  if (!userKey) {
    return NextResponse.json({
      success: false,
      message: "Key kosong",
    });
  }

  const key = await prisma.key.findUnique({
    where: {
      key: userKey,
    },
  });

  if (!key) {
    return NextResponse.json({
      success: false,
      message: "Key tidak ditemukan",
    });
  }

  if (!key.active) {
    return NextResponse.json({
      success: false,
      message: "Key sudah tidak aktif",
    });
  }

  if (
    key.expiresAt &&
    new Date() > key.expiresAt
  ) {
    return NextResponse.json({
      success: false,
      message: "Key sudah expired",
    });
  }

  return NextResponse.json({
    success: true,
    message: "Key berhasil diaktifkan",
    data: {
      key: key.key,
      expiresAt: key.expiresAt,
    },
  });
}