-- CreateTable
CREATE TABLE "ShiftAssignment" (
    "id" TEXT NOT NULL,
    "shiftTemplateId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "qualification" "Qualification" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShiftAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShiftAssignment_weekStart_shiftTemplateId_idx" ON "ShiftAssignment"("weekStart", "shiftTemplateId");

-- CreateIndex
CREATE INDEX "ShiftAssignment_employeeId_weekStart_idx" ON "ShiftAssignment"("employeeId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "ShiftAssignment_shiftTemplateId_employeeId_dayOfWeek_weekSt_key" ON "ShiftAssignment"("shiftTemplateId", "employeeId", "dayOfWeek", "weekStart");

-- AddForeignKey
ALTER TABLE "ShiftAssignment" ADD CONSTRAINT "ShiftAssignment_shiftTemplateId_fkey" FOREIGN KEY ("shiftTemplateId") REFERENCES "ShiftTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftAssignment" ADD CONSTRAINT "ShiftAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
