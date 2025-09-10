/*
  Warnings:

  - You are about to drop the `assignment_submissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `assignments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `enrollments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `code` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `gradeLevel` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `maxStudents` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `classes` table. All the data in the column will be lost.
  - Added the required column `level` to the `classes` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "assignment_submissions_assignmentId_studentId_key";

-- DropIndex
DROP INDEX "enrollments_studentId_classId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "assignment_submissions";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "assignments";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "enrollments";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "subjects_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "topics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "topics_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "student_subjects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'assigned',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "student_subjects_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "student_subjects_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "student_progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "completedAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "student_progress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "student_progress_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_classes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_classes" ("createdAt", "id", "name", "updatedAt") SELECT "createdAt", "id", "name", "updatedAt" FROM "classes";
DROP TABLE "classes";
ALTER TABLE "new_classes" RENAME TO "classes";
CREATE UNIQUE INDEX "classes_name_key" ON "classes"("name");
CREATE UNIQUE INDEX "classes_level_key" ON "classes"("level");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "student_subjects_studentId_subjectId_key" ON "student_subjects"("studentId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "student_progress_studentId_topicId_key" ON "student_progress"("studentId", "topicId");
