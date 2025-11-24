import { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { storage, BahanBaku } from '../lib/storage';
import { calculateROP, getBahanBakuStats } from '../lib/calculations';
import { User } from '../lib/auth';

interface DashboardProps {
  currentUser: User;
}

export default function Dashboard({ currentUser }: DashboardProps) {
  const [bahanBaku, setBahanBaku] = useState<BahanBaku[]>([]);
  const [lowStockItems, setLowStockItems] = useState<BahanBaku[]>([]);

  useEffect(() => {
    const data = storage.getBahanBaku();
    const penerimaan = storage.getPenerimaan();
    const pengeluaran = storage.getPengeluaran();
    
    setBahanBaku(data);
    
    // Calculate ROP for each item and filter items below ROP
    const belowROP = data.filter(item => {
      const rop = calculateROP(item.id, penerimaan, pengeluaran);
      return item.stokSaatIni <= rop;
    });
    setLowStockItems(belowROP);
  }, []);

  const totalStokValue = bahanBaku.reduce(
    (sum, item) => sum + item.stokSaatIni * item.hargaSatuan,
    0
  );

  const totalItems = bahanBaku.length;
  const itemsBelowROP = lowStockItems.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Selamat datang, {currentUser.nama}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Bahan Baku</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{totalItems} Item</div>
            <p className="text-muted-foreground mt-1">Jenis bahan baku terdaftar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Nilai Stok</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">
              Rp {totalStokValue.toLocaleString('id-ID')}
            </div>
            <p className="text-muted-foreground mt-1">Total nilai persediaan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Stok Menipis</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{itemsBelowROP} Item</div>
            <p className="text-muted-foreground mt-1">Di bawah ROP</p>
          </CardContent>
        </Card>
      </div>

      {/* Notifikasi */}
      {lowStockItems.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-gray-900">Notifikasi Stok</h2>
          
          {lowStockItems.map(item => {
            const penerimaan = storage.getPenerimaan();
            const pengeluaran = storage.getPengeluaran();
            const rop = calculateROP(item.id, penerimaan, pengeluaran);
            
            return (
              <Alert key={item.id} variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Notifikasi Stok Minimum (ROP)</AlertTitle>
                <AlertDescription>
                  <span className="text-gray-900">{item.nama}</span> mencapai titik pemesanan kembali. 
                  Stok saat ini: <span className="text-gray-900">{item.stokSaatIni} {item.satuan}</span>, 
                  ROP: <span className="text-gray-900">{rop} {item.satuan}</span>. 
                  Segera lakukan pemesanan untuk menghindari kehabisan stok.
                </AlertDescription>
              </Alert>
            );
          })}
        </div>
      )}

      {/* Tabel Stok */}
      <Card>
        <CardHeader>
          <CardTitle>Stok Bahan Baku</CardTitle>
          <CardDescription>Daftar semua bahan baku dan status stoknya</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Kode</th>
                  <th className="text-left p-3">Nama Bahan</th>
                  <th className="text-left p-3">Stok Saat Ini</th>
                  <th className="text-left p-3">Satuan</th>
                  <th className="text-left p-3">ROP (Otomatis)</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {bahanBaku.map(item => {
                  const penerimaan = storage.getPenerimaan();
                  const pengeluaran = storage.getPengeluaran();
                  const rop = calculateROP(item.id, penerimaan, pengeluaran);
                  
                  return (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{item.kode}</td>
                      <td className="p-3">{item.nama}</td>
                      <td className="p-3">{item.stokSaatIni}</td>
                      <td className="p-3">{item.satuan}</td>
                      <td className="p-3">{rop}</td>
                      <td className="p-3">
                        {item.stokSaatIni <= rop ? (
                          <Badge variant="destructive">Menipis</Badge>
                        ) : item.stokSaatIni <= rop * 1.5 ? (
                          <Badge className="bg-orange-500">Perlu Perhatian</Badge>
                        ) : (
                          <Badge className="bg-green-500">Aman</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
