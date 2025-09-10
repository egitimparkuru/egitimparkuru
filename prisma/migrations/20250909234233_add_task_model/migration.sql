/*
  Warnings:

  - You are about to drop the column `attachments` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `dueDate` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `maxPoints` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `tasks` table. All the data in the column will be lost.
  - Added the required column `endDate` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resourceName` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectId` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `tasks` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "startTime" TEXT,
    "endDate" DATETIME NOT NULL,
    "endTime" TEXT,
    "type" TEXT NOT NULL,
    "resourceName" TEXT NOT NULL,
    "pageStart" INTEGER,
    "pageEnd" INTEGER,
    "videoCount" INTEGER,
    "testCount" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "tasks_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tasks_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tasks_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_tasks" ("createdAt", "description", "id", "status", "studentId", "teacherId", "updatedAt") SELECT "createdAt", "description", "id", "status", "studentId", "teacherId", "updatedAt" FROM "tasks";
DROP TABLE "tasks";
ALTER TABLE "new_tasks" RENAME TO "tasks";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
