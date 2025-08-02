import { Prisma, PrismaClient } from "@prisma/client";

export function PrismaWithTx<T>(
    client: PrismaClient,
    txFx: (ctx: Prisma.TransactionClient) => Promise<T>) 
{
    return client.$transaction(txFx)
}