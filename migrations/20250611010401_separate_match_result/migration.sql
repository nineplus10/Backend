/*
  Warnings:

  - You are about to drop the column `end_time` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `start_time` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `winner` on the `matches` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[result_id]` on the table `matches` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `start` to the `matches` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "matches" DROP CONSTRAINT "matches_winner_fkey";

-- AlterTable
ALTER TABLE "matches" DROP COLUMN "end_time",
DROP COLUMN "start_time",
DROP COLUMN "winner",
ADD COLUMN     "result_id" INTEGER,
ADD COLUMN     "start" TIMESTAMP(6) NOT NULL;

-- CreateTable
CREATE TABLE "match_results" (
    "id" SERIAL NOT NULL,
    "winner_id" INTEGER NOT NULL,
    "game_log" VARCHAR(15) NOT NULL,
    "chat_log" VARCHAR(15) NOT NULL,
    "end" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "match_result_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "matches_result_id_key" ON "matches"("result_id");

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_resultid_fkey" FOREIGN KEY ("result_id") REFERENCES "match_results"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "match_results" ADD CONSTRAINT "match_result_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
