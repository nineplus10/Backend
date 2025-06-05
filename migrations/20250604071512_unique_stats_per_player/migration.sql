/*
  Warnings:

  - A unique constraint covering the columns `[player_id]` on the table `stats` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "stats_player_id_key" ON "stats"("player_id");
