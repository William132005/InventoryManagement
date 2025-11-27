import { BahanBaku, TransaksiPenerimaan, TransaksiPengeluaran, BiayaPenyimpanan } from './storage';

/**
 * Menghitung permintaan harian rata-rata dari transaksi pengeluaran
 * Formula: Total Pengeluaran / Jumlah Hari
 */
export function calculateAverageDailyDemand(
  bahanBakuId: string,
  pengeluaran: TransaksiPengeluaran[]
): number {
  const filteredTransactions = pengeluaran.filter(t => t.bahanBakuId === bahanBakuId);
  
  if (filteredTransactions.length === 0) return 0;

  // Hitung total pengeluaran
  const totalPengeluaran = filteredTransactions.reduce((sum, t) => sum + t.jumlah, 0);

  // Hitung rentang hari dari transaksi pertama ke terakhir
  const dates = filteredTransactions.map(t => new Date(t.tanggal).getTime());
  const oldestDate = Math.min(...dates);
  const newestDate = Math.max(...dates);
  const daysDifference = Math.ceil((newestDate - oldestDate) / (1000 * 60 * 60 * 24)) || 1;

  // Permintaan harian rata-rata
  return totalPengeluaran / daysDifference;
}

/**
 * Menghitung lead time rata-rata dari transaksi penerimaan
 * Formula: Total Lead Time / Jumlah Transaksi
 */
export function calculateAverageLeadTime(
  bahanBakuId: string,
  penerimaan: TransaksiPenerimaan[]
): number {
  const filteredTransactions = penerimaan.filter(t => t.bahanBakuId === bahanBakuId);
  
  if (filteredTransactions.length === 0) return 7; // Default 7 hari jika belum ada data

  const totalLeadTime = filteredTransactions.reduce((sum, t) => sum + t.leadTimeDays, 0);
  return totalLeadTime / filteredTransactions.length;
}

/**
 * Menghitung ROP (Reorder Point)
 * Formula: Permintaan Harian Rata-rata × Waktu Tunggu (Lead Time)
 */
export function calculateROP(
  bahanBakuId: string,
  penerimaan: TransaksiPenerimaan[],
  pengeluaran: TransaksiPengeluaran[]
): number {
  const avgDailyDemand = calculateAverageDailyDemand(bahanBakuId, pengeluaran);
  const avgLeadTime = calculateAverageLeadTime(bahanBakuId, penerimaan);

  return Math.ceil(avgDailyDemand * avgLeadTime);
}

/**
 * Menghitung EOQ (Economic Order Quantity)
 * Formula: √((2 × D × S) / H)
 * D = Demand per tahun (dari transaksi keluar)
 * S = Biaya pemesanan (dari transaksi masuk terbaru)
 * H = Biaya penyimpanan per unit per tahun (dari modul biaya penyimpanan)
 */
export function calculateEOQ(
  bahan: BahanBaku,
  pengeluaran: TransaksiPengeluaran[],
  penerimaan: TransaksiPenerimaan[],
  biayaPenyimpanan: BiayaPenyimpanan[]
): number {
  const avgDailyDemand = calculateAverageDailyDemand(bahan.id, pengeluaran);
  
  // Demand tahunan
  const annualDemand = avgDailyDemand * 365;
  
  if (annualDemand === 0) return 0;

  // Biaya pemesanan: ambil dari transaksi penerimaan terakhir
  const lastPenerimaan = penerimaan
    .filter(p => p.bahanBakuId === bahan.id)
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())[0];
  
  if (!lastPenerimaan) return 0;
  
  const orderingCost = lastPenerimaan.biayaPemesanan;

  // Biaya penyimpanan: ambil dari modul biaya penyimpanan terbaru
  const latestBiayaPenyimpanan = biayaPenyimpanan
    .filter(bp => bp.bahanBakuId === bahan.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  
  if (!latestBiayaPenyimpanan) return 0;
  
  const holdingCost = latestBiayaPenyimpanan.biayaPerUnit;

  if (holdingCost === 0) return 0;

  const eoq = Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);
  return Math.ceil(eoq);
}

/**
 * Mendapatkan statistik penggunaan bahan baku
 */
export function getBahanBakuStats(
  bahanBakuId: string,
  penerimaan: TransaksiPenerimaan[],
  pengeluaran: TransaksiPengeluaran[]
) {
  const avgDailyDemand = calculateAverageDailyDemand(bahanBakuId, pengeluaran);
  const avgLeadTime = calculateAverageLeadTime(bahanBakuId, penerimaan);
  const rop = calculateROP(bahanBakuId, penerimaan, pengeluaran);

  // Total transaksi
  const totalPenerimaan = penerimaan
    .filter(t => t.bahanBakuId === bahanBakuId)
    .reduce((sum, t) => sum + t.jumlah, 0);
  
  const totalPengeluaran = pengeluaran
    .filter(t => t.bahanBakuId === bahanBakuId)
    .reduce((sum, t) => sum + t.jumlah, 0);

  return {
    avgDailyDemand: avgDailyDemand.toFixed(2),
    avgLeadTime: avgLeadTime.toFixed(1),
    rop,
    totalPenerimaan,
    totalPengeluaran,
    jumlahTransaksiMasuk: penerimaan.filter(t => t.bahanBakuId === bahanBakuId).length,
    jumlahTransaksiKeluar: pengeluaran.filter(t => t.bahanBakuId === bahanBakuId).length,
  };
}
