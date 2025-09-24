/*
  Warnings:

  - You are about to drop the column `completed` on the `Todo` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Todo` table. All the data in the column will be lost.
  - You are about to drop the column `link` on the `Todo` table. All the data in the column will be lost.
  - Added the required column `dominio` to the `Todo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referrer` to the `Todo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timestamp` to the `Todo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Todo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userAgent` to the `Todo` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Todo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "dominio" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "userAgent" TEXT NOT NULL,
    "referrer" TEXT NOT NULL
);
INSERT INTO "new_Todo" ("id", "title") SELECT "id", "title" FROM "Todo";
DROP TABLE "Todo";
ALTER TABLE "new_Todo" RENAME TO "Todo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
