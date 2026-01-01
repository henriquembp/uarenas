-- CreateTable
CREATE TABLE "court_availability" (
    "id" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "dayOfWeek" INTEGER,
    "specificDate" TIMESTAMP(3),
    "timeSlot" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "court_availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "court_availability_courtId_dayOfWeek_timeSlot_key" ON "court_availability"("courtId", "dayOfWeek", "timeSlot");

-- CreateIndex
CREATE UNIQUE INDEX "court_availability_courtId_specificDate_timeSlot_key" ON "court_availability"("courtId", "specificDate", "timeSlot");

-- AddForeignKey
ALTER TABLE "court_availability" ADD CONSTRAINT "court_availability_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "courts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
