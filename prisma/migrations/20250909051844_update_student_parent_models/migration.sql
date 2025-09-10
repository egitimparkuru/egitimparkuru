/*
  Warnings:

  - You are about to drop the column `workplace` on the `parents` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfBirth` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyContact` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyPhone` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `gradeLevel` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `students` table. All the data in the column will be lost.
  - Added the required column `teacherId` to the `parents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacherId` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_parents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "occupation" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "parents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "parents_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_parents" ("createdAt", "id", "occupation", "updatedAt", "userId") SELECT "createdAt", "id", "occupation", "updatedAt", "userId" FROM "parents";
DROP TABLE "parents";
ALTER TABLE "new_parents" RENAME TO "parents";
CREATE UNIQUE INDEX "parents_userId_key" ON "parents"("userId");
CREATE TABLE "new_students" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "birthDate" DATETIME,
    "grade" TEXT,
    "city" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "students_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "students_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_students" ("createdAt", "id", "updatedAt", "userId") SELECT "createdAt", "id", "updatedAt", "userId" FROM "students";
DROP TABLE "students";
ALTER TABLE "new_students" RENAME TO "students";
CREATE UNIQUE INDEX "students_userId_key" ON "students"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
