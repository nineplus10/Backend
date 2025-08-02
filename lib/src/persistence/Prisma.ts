import { Prisma } from "@prisma/client";
import { PrismaClient } from "../_generated/prisma/index.ts";

export function PrismaWithTx<T>(txFx: (ctx: Prisma.TransactionClient) => Promise<T>) {
    const P = new PrismaClient();
    return P.$transaction(txFx)
}