/*
  Warnings:

  - Made the column `player_id` on table `auth_records` required. This step will fail if there are existing NULL values in that column.
  - Made the column `origin` on table `auth_records` required. This step will fail if there are existing NULL values in that column.
  - Made the column `attempted_at` on table `auth_records` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_ok` on table `auth_records` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `badges` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `badges` required. This step will fail if there are existing NULL values in that column.
  - Made the column `acquisition_info` on table `badges` required. This step will fail if there are existing NULL values in that column.
  - Made the column `winner` on table `matches` required. This step will fail if there are existing NULL values in that column.
  - Made the column `chat_log` on table `matches` required. This step will fail if there are existing NULL values in that column.
  - Made the column `player_id` on table `player_badges` required. This step will fail if there are existing NULL values in that column.
  - Made the column `badge_id` on table `player_badges` required. This step will fail if there are existing NULL values in that column.
  - Made the column `obtain_count` on table `player_badges` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bio` on table `players` required. This step will fail if there are existing NULL values in that column.
  - Made the column `player_id` on table `sessions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `origin` on table `sessions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_agent` on table `sessions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `token` on table `sessions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `issued_at` on table `sessions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `revoked_at` on table `sessions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `player_id` on table `stats` required. This step will fail if there are existing NULL values in that column.
  - Made the column `game_played` on table `stats` required. This step will fail if there are existing NULL values in that column.
  - Made the column `wins` on table `stats` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "auth_records" ALTER COLUMN "player_id" SET NOT NULL,
ALTER COLUMN "origin" SET NOT NULL,
ALTER COLUMN "attempted_at" SET NOT NULL,
ALTER COLUMN "is_ok" SET NOT NULL;

-- AlterTable
ALTER TABLE "badges" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "acquisition_info" SET NOT NULL;

-- AlterTable
ALTER TABLE "matches" ALTER COLUMN "winner" SET NOT NULL,
ALTER COLUMN "chat_log" SET NOT NULL;

-- AlterTable
ALTER TABLE "player_badges" ALTER COLUMN "player_id" SET NOT NULL,
ALTER COLUMN "badge_id" SET NOT NULL,
ALTER COLUMN "obtain_count" SET NOT NULL;

-- AlterTable
ALTER TABLE "players" ALTER COLUMN "bio" SET NOT NULL;

-- AlterTable
ALTER TABLE "sessions" ALTER COLUMN "player_id" SET NOT NULL,
ALTER COLUMN "origin" SET NOT NULL,
ALTER COLUMN "user_agent" SET NOT NULL,
ALTER COLUMN "token" SET NOT NULL,
ALTER COLUMN "issued_at" SET NOT NULL,
ALTER COLUMN "revoked_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "stats" ALTER COLUMN "player_id" SET NOT NULL,
ALTER COLUMN "game_played" SET NOT NULL,
ALTER COLUMN "wins" SET NOT NULL;
