import { Prisma } from "@prisma/client";

export function isPrismaError(error: any) {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}
