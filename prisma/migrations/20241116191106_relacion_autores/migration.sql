-- AlterTable
ALTER TABLE "Autor" ADD COLUMN     "fotoPerfil" TEXT;

-- CreateTable
CREATE TABLE "FavoritoAutor" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "autorId" INTEGER NOT NULL,

    CONSTRAINT "FavoritoAutor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FavoritoAutor_usuarioId_autorId_key" ON "FavoritoAutor"("usuarioId", "autorId");

-- AddForeignKey
ALTER TABLE "FavoritoAutor" ADD CONSTRAINT "FavoritoAutor_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoritoAutor" ADD CONSTRAINT "FavoritoAutor_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Autor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
