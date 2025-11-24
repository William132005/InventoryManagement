import { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Clock, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { storage, BahanBaku } from '../lib/storage';
import { calculateEOQ, calculateROP, getBahanBakuStats } from '../lib/calculations';

export default function PerhitunganPersediaan() {
  const [bahanBaku, setBahanBaku] = useState<BahanBaku[]>([]);
  const [selectedBahan, setSelectedBahan] = useState<BahanBaku | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [eoq, setEoq] = useState(0);
  const [rop, setRop] = useState(0);

  useEffect(() => {
    const data = storage.getBahanBaku();
    setBahanBaku(data);
    if (data.length > 0) {
      setSelectedBahan(data[0]);
    }
  }, []);

  useEffect(() => {
    if (selectedBahan) {
      const penerimaan = storage.getPenerimaan();
      const pengeluaran = storage.getPengeluaran();
      
      // Calculate EOQ
      const eoqValue = calculateEOQ(selectedBahan, pengeluaran);
      setEoq(eoqValue);
      
      // Calculate ROP
      const ropValue = calculateROP(selectedBahan.id, penerimaan, pengeluaran);
      setRop(ropValue);
      
      // Get stats
      const statsValue = getBahanBakuStats(selectedBahan.id, penerimaan, pengeluaran);
      setStats(statsValue);
    }
  }, [selectedBahan]);

  const handleBahanChange = (bahanId: string) => {
    const bahan = bahanBaku.find(b => b.id === bahanId);
    if (bahan) {
      setSelectedBahan(bahan);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900">Perhitungan Persediaan</h1>
        <p className="text-gray-600 mt-1">Hitung EOQ dan ROP secara otomatis berdasarkan data transaksi</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pilih Bahan Baku</CardTitle>
          <CardDescription>Pilih bahan baku untuk melakukan perhitungan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="bahan-select">Bahan Baku</Label>
            <select
              id="bahan-select"
              className="w-full max-w-md border border-gray-300 rounded-md p-2"
              value={selectedBahan?.id || ''}
              onChange={(e) => handleBahanChange(e.target.value)}
            >
              {bahanBaku.map(item => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {selectedBahan && stats && (
        <>
          {/* Info Transaksi */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle>Informasi Data Transaksi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-600">Total Transaksi Masuk</p>
                  <p className="text-gray-900 mt-1">{stats.jumlahTransaksiMasuk} transaksi</p>
                  <p className="text-gray-600 mt-1">{stats.totalPenerimaan} {selectedBahan.satuan}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Transaksi Keluar</p>
                  <p className="text-gray-900 mt-1">{stats.jumlahTransaksiKeluar} transaksi</p>
                  <p className="text-gray-600 mt-1">{stats.totalPengeluaran} {selectedBahan.satuan}</p>
                </div>
                <div>
                  <p className="text-gray-600">Permintaan Harian Rata-rata</p>
                  <p className="text-gray-900 mt-1">{stats.avgDailyDemand} {selectedBahan.satuan}/hari</p>
                  <p className="text-gray-600 mt-1">Dihitung dari transaksi keluar</p>
                </div>
                <div>
                  <p className="text-gray-600">Lead Time Rata-rata</p>
                  <p className="text-gray-900 mt-1">{stats.avgLeadTime} hari</p>
                  <p className="text-gray-600 mt-1">Dihitung dari transaksi masuk</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Perhitungan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ROP Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-green-600" />
                  Reorder Point (ROP)
                </CardTitle>
                <CardDescription>Titik pemesanan kembali otomatis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-gray-600">ROP untuk {selectedBahan.nama}</p>
                    <div className="text-gray-900 mt-2">{rop} {selectedBahan.satuan}</div>
                  </div>
                  
                  <div className="pt-4 border-t space-y-3">
                    <h4 className="text-gray-900">Rumus:</h4>
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-gray-900">ROP = Permintaan Harian Rata-rata × Lead Time</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <h4 className="text-gray-900">Perhitungan:</h4>
                    <div className="space-y-1">
                      <p className="text-gray-600">Permintaan Harian = {stats.avgDailyDemand} {selectedBahan.satuan}/hari</p>
                      <p className="text-gray-600">Lead Time = {stats.avgLeadTime} hari</p>
                      <p className="text-gray-900 mt-2">ROP = {stats.avgDailyDemand} × {stats.avgLeadTime} = {rop} {selectedBahan.satuan}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t bg-yellow-50 p-3 rounded">
                    <p className="text-gray-900">💡 Rekomendasi:</p>
                    <p className="text-gray-600 mt-1">Lakukan pemesanan saat stok mencapai {rop} {selectedBahan.satuan} atau kurang untuk menghindari kehabisan stok.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* EOQ Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-purple-600" />
                  Economic Order Quantity (EOQ)
                </CardTitle>
                <CardDescription>Jumlah pemesanan optimal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-gray-600">EOQ untuk {selectedBahan.nama}</p>
                    <div className="text-gray-900 mt-2">{eoq} {selectedBahan.satuan}</div>
                  </div>
                  
                  <div className="pt-4 border-t space-y-3">
                    <h4 className="text-gray-900">Rumus:</h4>
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-gray-900">EOQ = √((2 × D × S) / H)</p>
                      <p className="text-gray-600 mt-1">D = Demand per tahun</p>
                      <p className="text-gray-600">S = Biaya pemesanan</p>
                      <p className="text-gray-600">H = Biaya penyimpanan per unit/tahun</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <h4 className="text-gray-900">Perhitungan:</h4>
                    <div className="space-y-1">
                      <p className="text-gray-600">Demand tahunan = {stats.avgDailyDemand} × 365 = {(parseFloat(stats.avgDailyDemand) * 365).toFixed(0)} {selectedBahan.satuan}</p>
                      <p className="text-gray-600">Biaya pemesanan = Rp {selectedBahan.biayaPemesanan.toLocaleString('id-ID')}</p>
                      <p className="text-gray-600">Biaya penyimpanan = Rp {selectedBahan.biayaPenyimpanan.toLocaleString('id-ID')}/unit</p>
                      <p className="text-gray-900 mt-2">EOQ = {eoq} {selectedBahan.satuan}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t bg-yellow-50 p-3 rounded">
                    <p className="text-gray-900">💡 Rekomendasi:</p>
                    <p className="text-gray-600 mt-1">Pesan sebanyak {eoq} {selectedBahan.satuan} setiap kali melakukan pemesanan untuk meminimalkan biaya total persediaan.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <CardHeader>
              <CardTitle>Ringkasan & Rekomendasi untuk {selectedBahan.nama}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-5 h-5 text-green-600" />
                      <h3 className="text-gray-900">Reorder Point (ROP)</h3>
                    </div>
                    <p className="text-gray-900">{rop} {selectedBahan.satuan}</p>
                    <p className="text-gray-600 mt-2">Pesan ulang saat stok mencapai atau di bawah nilai ini</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="w-5 h-5 text-purple-600" />
                      <h3 className="text-gray-900">Economic Order Quantity (EOQ)</h3>
                    </div>
                    <p className="text-gray-900">{eoq} {selectedBahan.satuan}</p>
                    <p className="text-gray-600 mt-2">Jumlah optimal setiap kali pesan untuk efisiensi biaya</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <h3 className="text-gray-900 mb-2">📋 Strategi Pemesanan Optimal:</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Pantau stok {selectedBahan.nama} secara berkala</li>
                    <li>• Saat stok mencapai <span className="text-gray-900">{rop} {selectedBahan.satuan}</span>, segera lakukan pemesanan</li>
                    <li>• Pesan sebanyak <span className="text-gray-900">{eoq} {selectedBahan.satuan}</span> setiap kali order</li>
                    <li>• Dengan lead time {stats.avgLeadTime} hari, barang akan tiba sebelum stok habis</li>
                    <li>• Strategi ini meminimalkan biaya pemesanan dan penyimpanan</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <h3 className="text-gray-900 mb-2">⚠️ Catatan Penting:</h3>
                  <p className="text-gray-600">Perhitungan ini berdasarkan data transaksi historis. Semakin banyak data transaksi yang diinput, semakin akurat hasil perhitungannya. Pastikan selalu menginput data penerimaan dan pengeluaran secara rutin.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
