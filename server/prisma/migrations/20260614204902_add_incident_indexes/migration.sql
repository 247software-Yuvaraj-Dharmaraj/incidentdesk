-- CreateIndex
CREATE INDEX "Incident_assigneeId_idx" ON "Incident"("assigneeId");

-- CreateIndex
CREATE INDEX "Incident_dueDate_idx" ON "Incident"("dueDate");

-- CreateIndex
CREATE INDEX "Incident_resolvedAt_idx" ON "Incident"("resolvedAt");

-- CreateIndex
CREATE INDEX "Incident_createdAt_idx" ON "Incident"("createdAt");
