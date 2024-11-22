/*
  Warnings:

  - A unique constraint covering the columns `[usuarioId,libroId]` on the table `Recordatorio` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Recordatorio_usuarioId_libroId_key" ON "Recordatorio"("usuarioId", "libroId");
