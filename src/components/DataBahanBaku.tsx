import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { storage, BahanBaku } from '../lib/storage';
import { calculateROP } from '../lib/calculations';
import { User } from '../lib/auth';
import { toast } from 'sonner@2.0.3';

interface DataBahanBakuProps {
  currentUser: User;
}

export default function DataBahanBaku({ currentUser }: DataBahanBakuProps) {
  const [bahanBaku, setBahanBaku] = useState<BahanBaku[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BahanBaku | null>(null);
  
  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    satuan: '',
    hargaSatuan: 0,
    biayaPemesanan: 0,
    biayaPenyimpanan: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const data = storage.getBahanBaku();
    setBahanBaku(data);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = storage.getBahanBaku();
    
    if (editingItem) {
      const updated = data.map(item =>
        item.id === editingItem.id
          ? { ...item, ...formData }
          : item
      );
      storage.saveBahanBaku(updated);
      toast.success('Bahan baku berhasil diperbarui');
    } else {
      const newItem: BahanBaku = {
        id: Date.now().toString(),
        ...formData,
        stokSaatIni: 0,
        createdAt: new Date().toISOString(),
      };
      storage.saveBahanBaku([...data, newItem]);
      toast.success('Bahan baku berhasil ditambahkan');
    }
    
    loadData();
    closeDialog();
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus bahan baku ini?')) {
      const data = storage.getBahanBaku();
      const filtered = data.filter(item => item.id !== id);
      storage.saveBahanBaku(filtered);
      loadData();
      toast.success('Bahan baku berhasil dihapus');
    }
  };

  const handleEdit = (item: BahanBaku) => {
    setEditingItem(item);
    setFormData({
      kode: item.kode,
      nama: item.nama,
      satuan: item.satuan,
      hargaSatuan: item.hargaSatuan,
      biayaPemesanan: item.biayaPemesanan,
      biayaPenyimpanan: item.biayaPenyimpanan,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({
      kode: '',
      nama: '',
      satuan: '',
      hargaSatuan: 0,
      biayaPemesanan: 0,
      biayaPenyimpanan: 0,
    });
  };

  const filteredData = bahanBaku.filter(item =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-gray-900">Data Bahan Baku</h1>
          <p className="text-gray-600 mt-1">Kelola data bahan baku</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Bahan Baku
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Bahan Baku</CardTitle>
          <CardDescription>Lihat dan kelola semua bahan baku</CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cari bahan baku..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Kode</th>
                  <th className="text-left p-3">Nama</th>
                  <th className="text-left p-3">Stok</th>
                  <th className="text-left p-3">Satuan</th>
                  <th className="text-left p-3">Harga</th>
                  <th className="text-left p-3">ROP</th>
                  <th className="text-left p-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(item => {
                  const penerimaan = storage.getPenerimaan();
                  const pengeluaran = storage.getPengeluaran();
                  const rop = calculateROP(item.id, penerimaan, pengeluaran);
                  
                  return (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{item.kode}</td>
                      <td className="p-3">{item.nama}</td>
                      <td className="p-3">{item.stokSaatIni}</td>
                      <td className="p-3">{item.satuan}</td>
                      <td className="p-3">Rp {item.hargaSatuan.toLocaleString('id-ID')}</td>
                      <td className="p-3">{rop}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Tambah/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Bahan Baku' : 'Tambah Bahan Baku'}
            </DialogTitle>
            <DialogDescription>
              Isi form di bawah untuk {editingItem ? 'mengubah' : 'menambahkan'} bahan baku
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="kode">Kode Bahan</Label>
                <Input
                  id="kode"
                  value={formData.kode}
                  onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Bahan</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="satuan">Satuan</Label>
                <Input
                  id="satuan"
                  value={formData.satuan}
                  onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                  placeholder="Contoh: Meter, Cone, Lusin, Pcs, Roll, Gross"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hargaSatuan">Harga Satuan (Rp)</Label>
                <Input
                  id="hargaSatuan"
                  type="number"
                  value={formData.hargaSatuan}
                  onChange={(e) => setFormData({ ...formData, hargaSatuan: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="biayaPemesanan">Biaya Pemesanan (Rp)</Label>
                <Input
                  id="biayaPemesanan"
                  type="number"
                  value={formData.biayaPemesanan}
                  onChange={(e) => setFormData({ ...formData, biayaPemesanan: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="biayaPenyimpanan">Biaya Penyimpanan (Rp/unit/tahun)</Label>
                <Input
                  id="biayaPenyimpanan"
                  type="number"
                  value={formData.biayaPenyimpanan}
                  onChange={(e) => setFormData({ ...formData, biayaPenyimpanan: Number(e.target.value) })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Batal
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                {editingItem ? 'Simpan Perubahan' : 'Tambah'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}