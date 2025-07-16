import { Prisma } from "@prisma/client";
import { PrismaClient } from "_lib/_generated/prisma";

export function PrismaWithTx<T>(txFx: (ctx: Prisma.TransactionClient) => Promise<T>) {
    const P = new PrismaClient();
    return P.$transaction(txFx)
}