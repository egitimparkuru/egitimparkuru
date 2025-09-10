/*
  Warnings:

  - You are about to drop the `parent_students` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `address` on the `parents` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "parent_students_parentId_studentId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "parent_students";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_parents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "studentId" TEXT,
    "occupation" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "parents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "parents_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "parents_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_parents" ("createdAt", "id", "notes", "occupation", "teacherId", "updatedAt", "userId") SELECT "createdAt", "id", "notes", "occupation", "teacherId", "updatedAt", "userId" FROM "parents";
DROP TABLE "parents";
ALTER TABLE "new_parents" RENAME TO "parents";
CREATE UNIQUE INDEX "parents_userId_key" ON "parents"("userId");
CREATE UNIQUE INDEX "parents_studentId_key" ON "parents"("studentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
