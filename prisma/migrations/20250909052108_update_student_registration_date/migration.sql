/*
  Warnings:

  - You are about to drop the column `birthDate` on the `students` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_students" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "registrationDate" DATETIME,
    "grade" TEXT,
    "city" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "students_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "students_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_students" ("city", "createdAt", "grade", "id", "notes", "teacherId", "updatedAt", "userId") SELECT "city", "createdAt", "grade", "id", "notes", "teacherId", "updatedAt", "userId" FROM "students";
DROP TABLE "students";
ALTER TABLE "new_students" RENAME TO "students";
CREATE UNIQUE INDEX "students_userId_key" ON "students"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
