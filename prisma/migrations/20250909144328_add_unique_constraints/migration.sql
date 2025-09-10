/*
  Warnings:

  - A unique constraint covering the columns `[name,classId]` on the table `subjects` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,subjectId]` on the table `topics` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "subjects_name_classId_key" ON "subjects"("name", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "topics_name_subjectId_key" ON "topics"("name", "subjectId");
