-- AlterTable
ALTER TABLE "tasks" ADD COLUMN "blankAnswers" INTEGER;
ALTER TABLE "tasks" ADD COLUMN "completedAt" DATETIME;
ALTER TABLE "tasks" ADD COLUMN "completionNote" TEXT;
ALTER TABLE "tasks" ADD COLUMN "correctAnswers" INTEGER;
ALTER TABLE "tasks" ADD COLUMN "testResult" TEXT;
ALTER TABLE "tasks" ADD COLUMN "totalScore" DECIMAL;
ALTER TABLE "tasks" ADD COLUMN "wrongAnswers" INTEGER;

-- CreateTable
CREATE TABLE "tests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subject" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "questionCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "isRandomOrder" BOOLEAN NOT NULL DEFAULT false,
    "showCorrectAnswers" BOOLEAN NOT NULL DEFAULT true,
    "allowRetake" BOOLEAN NOT NULL DEFAULT false,
    "maxAttempts" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "tests_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "test_questions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "testId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'multiple_choice',
    "points" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL,
    "options" TEXT,
    "correctAnswer" TEXT,
    "explanation" TEXT,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "test_questions_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "test_attempts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "testId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "score" INTEGER,
    "maxScore" INTEGER,
    "percentage" DECIMAL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "test_attempts_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "test_attempts_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "test_answers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "test_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "test_attempts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "test_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "test_questions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "test_results" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "score" INTEGER,
    "totalQuestions" INTEGER,
    "correctAnswers" INTEGER,
    "wrongAnswers" INTEGER,
    "duration" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "notes" TEXT,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "test_results_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "test_results_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "test_answers_attemptId_questionId_key" ON "test_answers"("attemptId", "questionId");
