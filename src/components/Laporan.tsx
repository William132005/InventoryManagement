import { useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { storage, BahanBaku, TransaksiPenerimaan, TransaksiPengeluaran } from '../lib/storage';
import { calculateROP, calculateEOQ } from '../lib/calculations';

// Fungsi untuk menentukan status stok
const getStokStatus = (stok: number, rop: number, eoq: number) => {
  if (stok === 0) {
    return { text: 'Stok Habis', color: 'text-red-700 bg-red-100 px-2 py-1 rounded' };
  } else if (stok < rop) {
    return { text: 'Perlu Order Segera', color: 'text-red-600 bg-red-50 px-2 py-1 rounded' };
  } else if (stok < eoq) {
    return { text: 'Aman', color: 'text-green-600 bg-green-50 px-2 py-1 rounded' };
  } else {
    return { text: 'Optimal', color: 'text-blue-600 bg-blue-50 px-2 py-1 rounded' };
  }
};

export default function Laporan() {
  const [bahanBaku, setBahanBaku] = useState<BahanBaku[]>([]);
  const [penerimaan, setPenerimaan] = useState<TransaksiPenerimaan[]>([]);
  const [pengeluaran, setPengeluaran] = useState<TransaksiPengeluaran[]>([]);

  useEffect(() => {
    setBahanBaku(storage.getBahanBaku());
    setPenerimaan(storage.getPenerimaan());
    setPengeluaran(storage.getPengeluaran());
  }, []);

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalNilaiStok = bahanBaku.reduce(
    (sum, item) => sum + (item.stokSaatIni * item.hargaSatuan),
    0
  );

  const totalPenerimaan = penerimaan.reduce((sum, item) => {
    const bahan = bahanBaku.find(b => b.id === item.bahanBakuId);
    return sum + (bahan ? item.jumlah * bahan.hargaSatuan : 0);
  }, 0);

  const totalPengeluaran = pengeluaran.reduce((sum, item) => {
    const bahan = bahanBaku.find(b => b.id === item.bahanBakuId);
    return sum + (bahan ? item.jumlah * bahan.hargaSatuan : 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900">Laporan</h1>
        <p className="text-gray-600 mt-1">Laporan persediaan bahan baku</p>
      </div>

      <Tabs defaultValue="stok" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="stok">Laporan Stok</TabsTrigger>
          <TabsTrigger value="penerimaan">Laporan Penerimaan</TabsTrigger>
          <TabsTrigger value="pengeluaran">Laporan Pengeluaran</TabsTrigger>
        </TabsList>

        {/* Laporan Stok */}
        <TabsContent value="stok" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-gray-900">Laporan Stok Bahan Baku</h2>
              <p className="text-gray-600 mt-1">Total Nilai Stok: Rp {totalNilaiStok.toLocaleString('id-ID')}</p>
            </div>
            <Button
              onClick={() => exportToCSV(bahanBaku, 'laporan-stok.csv')}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Stok Bahan Baku</CardTitle>
              <CardDescription>Laporan detail stok semua bahan baku</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Kode</th>
                      <th className="text-left p-3">Nama Bahan</th>
                      <th className="text-left p-3">Stok Awal</th>
                      <th className="text-left p-3">Stok Saat Ini</th>
                      <th className="text-left p-3">Satuan</th>
                      <th className="text-left p-3">Harga Satuan</th>
                      <th className="text-left p-3">Total Nilai</th>
                      <th className="text-left p-3">ROP</th>
                      <th className="text-left p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bahanBaku.map(item => {
                      const rop = calculateROP(item.id, penerimaan, pengeluaran);
                      const biayaPenyimpanan = storage.getBiayaPenyimpanan();
                      const eoq = calculateEOQ(item, pengeluaran, penerimaan, biayaPenyimpanan);
                      const status = getStokStatus(item.stokSaatIni, rop, eoq);
                      return (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{item.kode}</td>
                          <td className="p-3">{item.nama}</td>
                          <td className="p-3">0</td>
                          <td className="p-3">{item.stokSaatIni}</td>
                          <td className="p-3">{item.satuan}</td>
                          <td className="p-3">Rp {item.hargaSatuan.toLocaleString('id-ID')}</td>
                          <td className="p-3">Rp {(item.stokSaatIni * item.hargaSatuan).toLocaleString('id-ID')}</td>
                          <td className="p-3">{rop}</td>
                          <td className="p-3">
                            <span className={status.color}>{status.text}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2">
                      <td colSpan={6} className="p-3 text-right">Total Nilai Stok:</td>
                      <td className="p-3">Rp {totalNilaiStok.toLocaleString('id-ID')}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Laporan Penerimaan */}
        <TabsContent value="penerimaan" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-gray-900">Laporan Penerimaan Bahan Baku</h2>
              <p className="text-gray-600 mt-1">Total Penerimaan: {penerimaan.length} transaksi - Rp {totalPenerimaan.toLocaleString('id-ID')}</p>
            </div>
            <Button
              onClick={() => exportToCSV(penerimaan, 'laporan-penerimaan.csv')}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Riwayat Penerimaan</CardTitle>
              <CardDescription>Laporan detail semua transaksi penerimaan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Tanggal</th>
                      <th className="text-left p-3">No. Dokumen</th>
                      <th className="text-left p-3">Nama Barang</th>
                      <th className="text-left p-3">Jumlah</th>
                      <th className="text-left p-3">Supplier</th>
                      <th className="text-left p-3">Nilai</th>
                      <th className="text-left p-3">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {penerimaan.map(item => {
                      const bahan = bahanBaku.find(b => b.id === item.bahanBakuId);
                      const nilai = bahan ? item.jumlah * bahan.hargaSatuan : 0;
                      return (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                          <td className="p-3">{item.nomorDokumen}</td>
                          <td className="p-3">{item.namaBarang}</td>
                          <td className="p-3">{item.jumlah}</td>
                          <td className="p-3">{item.supplier}</td>
                          <td className="p-3">Rp {nilai.toLocaleString('id-ID')}</td>
                          <td className="p-3">{item.keterangan}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Laporan Pengeluaran */}
        <TabsContent value="pengeluaran" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-gray-900">Laporan Pengeluaran Bahan Baku</h2>
              <p className="text-gray-600 mt-1">Total Pengeluaran: {pengeluaran.length} transaksi - Rp {totalPengeluaran.toLocaleString('id-ID')}</p>
            </div>
            <Button
              onClick={() => exportToCSV(pengeluaran, 'laporan-pengeluaran.csv')}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Riwayat Pengeluaran</CardTitle>
              <CardDescription>Laporan detail semua transaksi pengeluaran</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Tanggal</th>
                      <th className="text-left p-3">No. Dokumen</th>
                      <th className="text-left p-3">Nama Barang</th>
                      <th className="text-left p-3">Jumlah</th>
                      <th className="text-left p-3">Tujuan</th>
                      <th className="text-left p-3">Nilai</th>
                      <th className="text-left p-3">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pengeluaran.map(item => {
                      const bahan = bahanBaku.find(b => b.id === item.bahanBakuId);
                      const nilai = bahan ? item.jumlah * bahan.hargaSatuan : 0;
                      return (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                          <td className="p-3">{item.nomorDokumen}</td>
                          <td className="p-3">{item.namaBarang}</td>
                          <td className="p-3">{item.jumlah}</td>
                          <td className="p-3">{item.tujuan}</td>
                          <td className="p-3">Rp {nilai.toLocaleString('id-ID')}</td>
                          <td className="p-3">{item.keterangan}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}