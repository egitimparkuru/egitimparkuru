-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_routine_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacherId" TEXT NOT NULL,
    "subjectId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "dayOfWeek" INTEGER,
    "dayOfMonth" INTEGER,
    "time" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastExecuted" DATETIME,
    "nextExecution" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "routine_tasks_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "routine_tasks_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_routine_tasks" ("createdAt", "dayOfMonth", "dayOfWeek", "description", "frequency", "id", "isActive", "lastExecuted", "name", "nextExecution", "subjectId", "teacherId", "time", "type", "updatedAt") SELECT "createdAt", "dayOfMonth", "dayOfWeek", "description", "frequency", "id", "isActive", "lastExecuted", "name", "nextExecution", "subjectId", "teacherId", "time", "type", "updatedAt" FROM "routine_tasks";
DROP TABLE "routine_tasks";
ALTER TABLE "new_routine_tasks" RENAME TO "routine_tasks";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
