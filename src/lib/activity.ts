import { prisma } from "@/lib/prisma";

type ActivityTone = "success" | "info" | "warning";

type CreateActivityOptions = {
  action: string;
  detail: string;
  tone?: ActivityTone;
};

export async function createActivity({
  action,
  detail,
  tone = "info",
}: CreateActivityOptions) {
  return prisma.activity.create({
    data: {
      action,
      detail,
      tone,
    },
  });
}