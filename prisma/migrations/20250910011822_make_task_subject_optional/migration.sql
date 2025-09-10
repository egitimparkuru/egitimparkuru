-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "subjectId" TEXT,
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
INSERT INTO "new_tasks" ("createdAt", "description", "endDate", "endTime", "id", "pageEnd", "pageStart", "resourceName", "startDate", "startTime", "status", "studentId", "subjectId", "teacherId", "testCount", "type", "updatedAt", "videoCount") SELECT "createdAt", "description", "endDate", "endTime", "id", "pageEnd", "pageStart", "resourceName", "startDate", "startTime", "status", "studentId", "subjectId", "teacherId", "testCount", "type", "updatedAt", "videoCount" FROM "tasks";
DROP TABLE "tasks";
ALTER TABLE "new_tasks" RENAME TO "tasks";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
