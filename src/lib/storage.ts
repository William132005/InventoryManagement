export interface BahanBaku {
  id: string;
  kode: string;
  nama: string;
  satuan: string;
  stokSaatIni: number;
  hargaSatuan: number;
  biayaPemesanan: number;
  biayaPenyimpanan: number;
  createdAt: string;
}

export interface TransaksiPenerimaan {
  id: string;
  tanggal: string;
  nomorDokumen: string;
  bahanBakuId: string;
  namaBarang: string;
  jumlah: number;
  supplier: string;
  leadTimeDays: number; // Waktu tunggu dari pemesanan sampai diterima (hari)
  tanggalPesan?: string; // Tanggal pemesanan
  keterangan: string;
}

export interface TransaksiPengeluaran {
  id: string;
  tanggal: string;
  nomorDokumen: string;
  bahanBakuId: string;
  namaBarang: string;
  jumlah: number;
  tujuan: string;
  keterangan: string;
}

const STORAGE_KEYS = {
  BAHAN_BAKU: 'bahan-baku-mahameru',
  PENERIMAAN: 'transaksi-penerimaan-mahameru',
  PENGELUARAN: 'transaksi-pengeluaran-mahameru',
};

// Initialize with sample data
const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.BAHAN_BAKU)) {
    const sampleData: BahanBaku[] = [
      {
        id: '1',
        kode: 'BB001',
        nama: 'Kain Cotton Combed 30s',
        satuan: 'Meter',
        stokSaatIni: 0,
        hargaSatuan: 35000,
        biayaPemesanan: 150000,
        biayaPenyimpanan: 2500,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        kode: 'BB002',
        nama: 'Kain Polyester PE',
        satuan: 'Meter',
        stokSaatIni: 0,
        hargaSatuan: 28000,
        biayaPemesanan: 120000,
        biayaPenyimpanan: 2000,
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        kode: 'BB003',
        nama: 'Benang Jahit Polyester',
        satuan: 'Cone',
        stokSaatIni: 0,
        hargaSatuan: 15000,
        biayaPemesanan: 80000,
        biayaPenyimpanan: 1000,
        createdAt: new Date().toISOString(),
      },
      {
        id: '4',
        kode: 'BB004',
        nama: 'Benang Obras',
        satuan: 'Cone',
        stokSaatIni: 0,
        hargaSatuan: 12000,
        biayaPemesanan: 70000,
        biayaPenyimpanan: 800,
        createdAt: new Date().toISOString(),
      },
      {
        id: '5',
        kode: 'BB005',
        nama: 'Rib Kain (Bahan Kerah)',
        satuan: 'Meter',
        stokSaatIni: 0,
        hargaSatuan: 25000,
        biayaPemesanan: 100000,
        biayaPenyimpanan: 1500,
        createdAt: new Date().toISOString(),
      },
      {
        id: '6',
        kode: 'BB006',
        nama: 'Tinta Sablon Rubber Putih',
        satuan: 'Kg',
        stokSaatIni: 0,
        hargaSatuan: 75000,
        biayaPemesanan: 80000,
        biayaPenyimpanan: 3000,
        createdAt: new Date().toISOString(),
      },
      {
        id: '7',
        kode: 'BB007',
        nama: 'Tinta Sablon Rubber Hitam',
        satuan: 'Kg',
        stokSaatIni: 0,
        hargaSatuan: 75000,
        biayaPemesanan: 80000,
        biayaPenyimpanan: 3000,
        createdAt: new Date().toISOString(),
      },
      {
        id: '8',
        kode: 'BB008',
        nama: 'Tinta Sablon Plastisol',
        satuan: 'Kg',
        stokSaatIni: 0,
        hargaSatuan: 95000,
        biayaPemesanan: 90000,
        biayaPenyimpanan: 3500,
        createdAt: new Date().toISOString(),
      },
      {
        id: '9',
        kode: 'BB009',
        nama: 'Kardus Packing Kaos (30x25x5 cm)',
        satuan: 'Pcs',
        stokSaatIni: 0,
        hargaSatuan: 3500,
        biayaPemesanan: 60000,
        biayaPenyimpanan: 200,
        createdAt: new Date().toISOString(),
      },
      {
        id: '10',
        kode: 'BB010',
        nama: 'Kardus Packing Kemeja (35x30x7 cm)',
        satuan: 'Pcs',
        stokSaatIni: 0,
        hargaSatuan: 4500,
        biayaPemesanan: 60000,
        biayaPenyimpanan: 250,
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.BAHAN_BAKU, JSON.stringify(sampleData));
  }
};

initializeData();

export const storage = {
  getBahanBaku: (): BahanBaku[] => {
    const data = localStorage.getItem(STORAGE_KEYS.BAHAN_BAKU);
    return data ? JSON.parse(data) : [];
  },

  saveBahanBaku: (data: BahanBaku[]) => {
    localStorage.setItem(STORAGE_KEYS.BAHAN_BAKU, JSON.stringify(data));
  },

  getPenerimaan: (): TransaksiPenerimaan[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PENERIMAAN);
    return data ? JSON.parse(data) : [];
  },

  savePenerimaan: (data: TransaksiPenerimaan[]) => {
    localStorage.setItem(STORAGE_KEYS.PENERIMAAN, JSON.stringify(data));
  },

  getPengeluaran: (): TransaksiPengeluaran[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PENGELUARAN);
    return data ? JSON.parse(data) : [];
  },

  savePengeluaran: (data: TransaksiPengeluaran[]) => {
    localStorage.setItem(STORAGE_KEYS.PENGELUARAN, JSON.stringify(data));
  },
};