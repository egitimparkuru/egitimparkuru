-- CreateTable
CREATE TABLE "routine_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacherId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "_RoutineTaskStudents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_RoutineTaskStudents_A_fkey" FOREIGN KEY ("A") REFERENCES "routine_tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_RoutineTaskStudents_B_fkey" FOREIGN KEY ("B") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_RoutineTaskStudents_AB_unique" ON "_RoutineTaskStudents"("A", "B");

-- CreateIndex
CREATE INDEX "_RoutineTaskStudents_B_index" ON "_RoutineTaskStudents"("B");
