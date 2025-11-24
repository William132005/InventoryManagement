import { useState, useEffect } from 'react';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { storage, BahanBaku, TransaksiPenerimaan, TransaksiPengeluaran } from '../lib/storage';
import { calculateROP } from '../lib/calculations';
import { PERMISSIONS, User } from '../lib/auth';
import { toast } from 'sonner@2.0.3';

interface TransaksiPersediaanProps {
  currentUser: User;
}

export default function TransaksiPersediaan({ currentUser }: TransaksiPersediaanProps) {
  const [bahanBaku, setBahanBaku] = useState<BahanBaku[]>([]);
  const [penerimaan, setPenerimaan] = useState<TransaksiPenerimaan[]>([]);
  const [pengeluaran, setPengeluaran] = useState<TransaksiPengeluaran[]>([]);
  const [isPenerimaanOpen, setIsPenerimaanOpen] = useState(false);
  const [isPengeluaranOpen, setIsPengeluaranOpen] = useState(false);

  const [penerimaanForm, setPenerimaanForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    nomorDokumen: '',
    bahanBakuId: '',
    jumlah: 0,
    supplier: '',
    leadTimeDays: 0,
    tanggalPesan: '',
    keterangan: '',
  });

  const [pengeluaranForm, setPengeluaranForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    nomorDokumen: '',
    bahanBakuId: '',
    jumlah: 0,
    tujuan: '',
    keterangan: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setBahanBaku(storage.getBahanBaku());
    setPenerimaan(storage.getPenerimaan());
    setPengeluaran(storage.getPengeluaran());
  };

  const handlePenerimaanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedBahan = bahanBaku.find(b => b.id === penerimaanForm.bahanBakuId);
    if (!selectedBahan) return;

    // Calculate lead time from tanggalPesan and tanggal (tanggal datang)
    const tanggalPesan = new Date(penerimaanForm.tanggalPesan);
    const tanggalDatang = new Date(penerimaanForm.tanggal);
    const leadTimeDays = Math.ceil((tanggalDatang.getTime() - tanggalPesan.getTime()) / (1000 * 60 * 60 * 24));

    // Add transaction
    const newTransaction: TransaksiPenerimaan = {
      id: Date.now().toString(),
      ...penerimaanForm,
      leadTimeDays: Math.max(0, leadTimeDays), // Lead time tidak boleh negatif
      namaBarang: selectedBahan.nama,
    };
    
    const allPenerimaan = storage.getPenerimaan();
    storage.savePenerimaan([...allPenerimaan, newTransaction]);

    // Update stock automatically
    const updatedBahanBaku = bahanBaku.map(item =>
      item.id === penerimaanForm.bahanBakuId
        ? { ...item, stokSaatIni: item.stokSaatIni + penerimaanForm.jumlah }
        : item
    );
    storage.saveBahanBaku(updatedBahanBaku);

    loadData();
    setIsPenerimaanOpen(false);
    resetPenerimaanForm();
    toast.success(`Penerimaan berhasil dicatat! Lead time: ${Math.max(0, leadTimeDays)} hari`);
  };

  const handlePengeluaranSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedBahan = bahanBaku.find(b => b.id === pengeluaranForm.bahanBakuId);
    if (!selectedBahan) return;

    if (selectedBahan.stokSaatIni < pengeluaranForm.jumlah) {
      toast.error('Stok tidak mencukupi!');
      return;
    }

    // Add transaction
    const newTransaction: TransaksiPengeluaran = {
      id: Date.now().toString(),
      ...pengeluaranForm,
      namaBarang: selectedBahan.nama,
    };
    
    const allPengeluaran = storage.getPengeluaran();
    storage.savePengeluaran([...allPengeluaran, newTransaction]);

    // Update stock automatically
    const updatedBahanBaku = bahanBaku.map(item =>
      item.id === pengeluaranForm.bahanBakuId
        ? { ...item, stokSaatIni: item.stokSaatIni - pengeluaranForm.jumlah }
        : item
    );
    storage.saveBahanBaku(updatedBahanBaku);

    loadData();
    setIsPengeluaranOpen(false);
    resetPengeluaranForm();
    toast.success('Pengeluaran berhasil dicatat dan stok diperbarui');
  };

  const resetPenerimaanForm = () => {
    setPenerimaanForm({
      tanggal: new Date().toISOString().split('T')[0],
      nomorDokumen: '',
      bahanBakuId: '',
      jumlah: 0,
      supplier: '',
      leadTimeDays: 0,
      tanggalPesan: '',
      keterangan: '',
    });
  };

  const resetPengeluaranForm = () => {
    setPengeluaranForm({
      tanggal: new Date().toISOString().split('T')[0],
      nomorDokumen: '',
      bahanBakuId: '',
      jumlah: 0,
      tujuan: '',
      keterangan: '',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900">Transaksi Persediaan</h1>
        <p className="text-gray-600 mt-1">Kelola penerimaan dan pengeluaran bahan baku</p>
      </div>

      <Tabs defaultValue="penerimaan" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="penerimaan">Penerimaan</TabsTrigger>
          <TabsTrigger value="pengeluaran">Pengeluaran</TabsTrigger>
        </TabsList>

        <TabsContent value="penerimaan" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => setIsPenerimaanOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <ArrowDownCircle className="w-4 h-4 mr-2" />
              Input Penerimaan
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Riwayat Penerimaan Bahan Baku</CardTitle>
              <CardDescription>Daftar semua transaksi penerimaan</CardDescription>
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
                      <th className="text-left p-3">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {penerimaan.map(item => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                        <td className="p-3">{item.nomorDokumen}</td>
                        <td className="p-3">{item.namaBarang}</td>
                        <td className="p-3">{item.jumlah}</td>
                        <td className="p-3">{item.supplier}</td>
                        <td className="p-3">{item.keterangan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pengeluaran" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => setIsPengeluaranOpen(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              Input Pengeluaran
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Riwayat Pengeluaran Bahan Baku</CardTitle>
              <CardDescription>Daftar semua transaksi pengeluaran</CardDescription>
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
                      <th className="text-left p-3">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pengeluaran.map(item => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                        <td className="p-3">{item.nomorDokumen}</td>
                        <td className="p-3">{item.namaBarang}</td>
                        <td className="p-3">{item.jumlah}</td>
                        <td className="p-3">{item.tujuan}</td>
                        <td className="p-3">{item.keterangan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Penerimaan */}
      <Dialog open={isPenerimaanOpen} onOpenChange={setIsPenerimaanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Input Penerimaan Bahan Baku</DialogTitle>
            <DialogDescription>
              Catat penerimaan bahan baku dan update stok otomatis
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePenerimaanSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tanggal-pesan">Tanggal Pesan</Label>
                <Input
                  id="tanggal-pesan"
                  type="date"
                  value={penerimaanForm.tanggalPesan}
                  onChange={(e) => setPenerimaanForm({ ...penerimaanForm, tanggalPesan: e.target.value })}
                  required
                />
                <p className="text-gray-500">Tanggal saat barang dipesan ke supplier</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggal-terima">Tanggal Terima (Datang)</Label>
                <Input
                  id="tanggal-terima"
                  type="date"
                  value={penerimaanForm.tanggal}
                  onChange={(e) => setPenerimaanForm({ ...penerimaanForm, tanggal: e.target.value })}
                  required
                />
                <p className="text-gray-500">Tanggal saat barang diterima di gudang</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-gray-900">💡 Lead Time akan dihitung otomatis</p>
                <p className="text-gray-600 mt-1">Lead Time = Tanggal Terima - Tanggal Pesan</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="no-dok-terima">Nomor Dokumen</Label>
                <Input
                  id="no-dok-terima"
                  value={penerimaanForm.nomorDokumen}
                  onChange={(e) => setPenerimaanForm({ ...penerimaanForm, nomorDokumen: e.target.value })}
                  placeholder="Contoh: PO-2024-001, SJ-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bahan-terima">Bahan Baku</Label>
                <select
                  id="bahan-terima"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={penerimaanForm.bahanBakuId}
                  onChange={(e) => setPenerimaanForm({ ...penerimaanForm, bahanBakuId: e.target.value })}
                  required
                >
                  <option value="">Pilih Bahan Baku</option>
                  {bahanBaku.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.nama} ({item.satuan})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jumlah-terima">Jumlah</Label>
                <Input
                  id="jumlah-terima"
                  type="number"
                  value={penerimaanForm.jumlah}
                  onChange={(e) => setPenerimaanForm({ ...penerimaanForm, jumlah: Number(e.target.value) })}
                  min="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={penerimaanForm.supplier}
                  onChange={(e) => setPenerimaanForm({ ...penerimaanForm, supplier: e.target.value })}
                  placeholder="Contoh: PT Primissima, Toko Kain Jaya, CV Benang Mas"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keterangan-terima">Keterangan</Label>
                <Input
                  id="keterangan-terima"
                  value={penerimaanForm.keterangan}
                  onChange={(e) => setPenerimaanForm({ ...penerimaanForm, keterangan: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPenerimaanOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Pengeluaran */}
      <Dialog open={isPengeluaranOpen} onOpenChange={setIsPengeluaranOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Input Pengeluaran Bahan Baku</DialogTitle>
            <DialogDescription>
              Catat pengeluaran bahan baku untuk produksi
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePengeluaranSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tanggal-keluar">Tanggal</Label>
                <Input
                  id="tanggal-keluar"
                  type="date"
                  value={pengeluaranForm.tanggal}
                  onChange={(e) => setPengeluaranForm({ ...pengeluaranForm, tanggal: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="no-dok-keluar">Nomor Dokumen</Label>
                <Input
                  id="no-dok-keluar"
                  value={pengeluaranForm.nomorDokumen}
                  onChange={(e) => setPengeluaranForm({ ...pengeluaranForm, nomorDokumen: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bahan-keluar">Bahan Baku</Label>
                <select
                  id="bahan-keluar"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={pengeluaranForm.bahanBakuId}
                  onChange={(e) => setPengeluaranForm({ ...pengeluaranForm, bahanBakuId: e.target.value })}
                  required
                >
                  <option value="">Pilih Bahan Baku</option>
                  {bahanBaku.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.nama} - Stok: {item.stokSaatIni} {item.satuan}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jumlah-keluar">Jumlah</Label>
                <Input
                  id="jumlah-keluar"
                  type="number"
                  value={pengeluaranForm.jumlah}
                  onChange={(e) => setPengeluaranForm({ ...pengeluaranForm, jumlah: Number(e.target.value) })}
                  min="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tujuan">Tujuan Produksi</Label>
                <Input
                  id="tujuan"
                  value={pengeluaranForm.tujuan}
                  onChange={(e) => setPengeluaranForm({ ...pengeluaranForm, tujuan: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keterangan-keluar">Keterangan</Label>
                <Input
                  id="keterangan-keluar"
                  value={pengeluaranForm.keterangan}
                  onChange={(e) => setPengeluaranForm({ ...pengeluaranForm, keterangan: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPengeluaranOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700">
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}