import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const key = await prisma.key.findUnique({
    where: {
      id: Number(body.id),
    },
  });

  if (!key) {
    return NextResponse.json({
      success: false,
      message: "Key tidak ditemukan",
    });
  }

  await prisma.key.update({
    where: {
      id: key.id,
    },
    data: {
      active: !key.active,
    },
  });

  return NextResponse.json({
    success: true,
  });
}