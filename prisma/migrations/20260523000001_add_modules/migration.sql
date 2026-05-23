-- Ciro Takip modülü
CREATE TABLE "CiroKayit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL,
    "tutar" DOUBLE PRECISION NOT NULL,
    "kategori" TEXT,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CiroKayit_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CiroKayit_userId_tarih_idx" ON "CiroKayit"("userId", "tarih");

CREATE TABLE "CiroHedef" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aylik" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "haftalik" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gunluk" DOUBLE PRECISION NOT NULL DEFAULT 0,
    CONSTRAINT "CiroHedef_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CiroHedef_userId_key" ON "CiroHedef"("userId");

-- Borç Takip modülü
CREATE TYPE "BorcDurum" AS ENUM ('BEKLIYOR', 'KISMI', 'ODENDI', 'GECIKTI');

CREATE TABLE "BorcMusteri" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kod" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "telefon" TEXT,
    "email" TEXT,
    "sehir" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BorcMusteri_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "BorcMusteri_userId_kod_key" ON "BorcMusteri"("userId", "kod");
CREATE INDEX "BorcMusteri_userId_idx" ON "BorcMusteri"("userId");

CREATE TABLE "Borc" (
    "id" TEXT NOT NULL,
    "musteriId" TEXT NOT NULL,
    "belgeNo" TEXT,
    "tutar" DOUBLE PRECISION NOT NULL,
    "vadeTarihi" TIMESTAMP(3) NOT NULL,
    "belgeTarihi" TIMESTAMP(3) NOT NULL,
    "durum" "BorcDurum" NOT NULL DEFAULT 'BEKLIYOR',
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Borc_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Borc_musteriId_idx" ON "Borc"("musteriId");

CREATE TABLE "BorcOdeme" (
    "id" TEXT NOT NULL,
    "musteriId" TEXT NOT NULL,
    "tutar" DOUBLE PRECISION NOT NULL,
    "odenmeTarihi" TIMESTAMP(3) NOT NULL,
    "yontem" TEXT,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BorcOdeme_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "BorcOdeme_musteriId_idx" ON "BorcOdeme"("musteriId");

-- Fox CRM modülü
CREATE TABLE "CrmMusteri" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "email" TEXT,
    "telefon" TEXT,
    "sirket" TEXT,
    "notlar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CrmMusteri_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CrmMusteri_userId_idx" ON "CrmMusteri"("userId");

CREATE TABLE "CrmTicket" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "musteriId" TEXT,
    "konu" TEXT NOT NULL,
    "icerik" TEXT NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'Yeni',
    "oncelik" TEXT NOT NULL DEFAULT 'Normal',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CrmTicket_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CrmTicket_userId_idx" ON "CrmTicket"("userId");

CREATE TABLE "CrmYanit" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "icerik" TEXT NOT NULL,
    "dahili" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CrmYanit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CrmProje" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "musteriId" TEXT,
    "ad" TEXT NOT NULL,
    "aciklama" TEXT,
    "durum" TEXT NOT NULL DEFAULT 'Devam Ediyor',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CrmProje_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CrmProje_userId_idx" ON "CrmProje"("userId");

CREATE TABLE "CrmProjeAdim" (
    "id" TEXT NOT NULL,
    "projeId" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "sira" INTEGER NOT NULL DEFAULT 0,
    "durum" TEXT NOT NULL DEFAULT 'Beklemede',
    CONSTRAINT "CrmProjeAdim_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CrmGorev" (
    "id" TEXT NOT NULL,
    "adimId" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "aciklama" TEXT,
    "durum" TEXT NOT NULL DEFAULT 'Beklemede',
    "sonTarih" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CrmGorev_pkey" PRIMARY KEY ("id")
);

-- Foreign keys
ALTER TABLE "CiroKayit" ADD CONSTRAINT "CiroKayit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CiroHedef" ADD CONSTRAINT "CiroHedef_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BorcMusteri" ADD CONSTRAINT "BorcMusteri_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Borc" ADD CONSTRAINT "Borc_musteriId_fkey" FOREIGN KEY ("musteriId") REFERENCES "BorcMusteri"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BorcOdeme" ADD CONSTRAINT "BorcOdeme_musteriId_fkey" FOREIGN KEY ("musteriId") REFERENCES "BorcMusteri"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CrmMusteri" ADD CONSTRAINT "CrmMusteri_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CrmTicket" ADD CONSTRAINT "CrmTicket_musteriId_fkey" FOREIGN KEY ("musteriId") REFERENCES "CrmMusteri"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CrmYanit" ADD CONSTRAINT "CrmYanit_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "CrmTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CrmProje" ADD CONSTRAINT "CrmProje_musteriId_fkey" FOREIGN KEY ("musteriId") REFERENCES "CrmMusteri"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CrmProjeAdim" ADD CONSTRAINT "CrmProjeAdim_projeId_fkey" FOREIGN KEY ("projeId") REFERENCES "CrmProje"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CrmGorev" ADD CONSTRAINT "CrmGorev_adimId_fkey" FOREIGN KEY ("adimId") REFERENCES "CrmProjeAdim"("id") ON DELETE CASCADE ON UPDATE CASCADE;
