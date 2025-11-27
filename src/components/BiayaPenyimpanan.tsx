import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, DollarSign } from 'lucide-react';
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
import { storage, BahanBaku, BiayaPenyimpanan } from '../lib/storage';
import { User } from '../lib/auth';
import { toast } from 'sonner';

interface BiayaPenyimpananProps {
  currentUser: User;
}

export default function BiayaPenyimpananComponent({ currentUser }: BiayaPenyimpananProps) {
  const [biayaPenyimpanan, setBiayaPenyimpanan] = useState<BiayaPenyimpanan[]>([]);
  const [bahanBaku, setBahanBaku] = useState<BahanBaku[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BiayaPenyimpanan | null>(null);
  
  const [formData, setFormData] = useState({
    bahanBakuId: '',
    biayaPerUnit: 0,
    periode: '',
    keterangan: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setBiayaPenyimpanan(storage.getBiayaPenyimpanan());
    setBahanBaku(storage.getBahanBaku());
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const selectedBahan = bahanBaku.find((b: BahanBaku) => b.id === formData.bahanBakuId);
    if (!selectedBahan) {
      toast.error('Bahan baku tidak ditemukan');
      return;
    }

    const data = storage.getBiayaPenyimpanan();
    
    if (editingItem) {
      const updated = data.map(item =>
        item.id === editingItem.id
          ? { 
              ...item, 
              ...formData,
              namaBahanBaku: selectedBahan.nama,
              updatedAt: new Date().toISOString(),
            }
          : item
      );
      storage.saveBiayaPenyimpanan(updated);
      toast.success('Biaya penyimpanan berhasil diperbarui');
    } else {
      const newItem: BiayaPenyimpanan = {
        id: Date.now().toString(),
        ...formData,
        namaBahanBaku: selectedBahan.nama,
        createdAt: new Date().toISOString(),
      };
      storage.saveBiayaPenyimpanan([...data, newItem]);
      toast.success('Biaya penyimpanan berhasil ditambahkan');
    }
    
    loadData();
    closeDialog();
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus data biaya penyimpanan ini?')) {
      const data = storage.getBiayaPenyimpanan();
      const filtered = data.filter(item => item.id !== id);
      storage.saveBiayaPenyimpanan(filtered);
      loadData();
      toast.success('Biaya penyimpanan berhasil dihapus');
    }
  };

  const handleEdit = (item: BiayaPenyimpanan) => {
    setEditingItem(item);
    setFormData({
      bahanBakuId: item.bahanBakuId,
      biayaPerUnit: item.biayaPerUnit,
      periode: item.periode,
      keterangan: item.keterangan,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({
      bahanBakuId: '',
      biayaPerUnit: 0,
      periode: '',
      keterangan: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-gray-900">Biaya Penyimpanan</h1>
          <p className="text-gray-600 mt-1">Kelola biaya penyimpanan per bahan baku</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Biaya Penyimpanan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Biaya Penyimpanan</CardTitle>
          <CardDescription>Data biaya penyimpanan bahan baku per unit per tahun</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Bahan Baku</th>
                  <th className="text-left p-3">Biaya per Unit</th>
                  <th className="text-left p-3">Periode</th>
                  <th className="text-left p-3">Keterangan</th>
                  <th className="text-left p-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {biayaPenyimpanan.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-3 text-center text-gray-500">
                      Belum ada data biaya penyimpanan
                    </td>
                  </tr>
                ) : (
                  biayaPenyimpanan.map((item: BiayaPenyimpanan) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{item.namaBahanBaku}</td>
                      <td className="p-3">Rp {item.biayaPerUnit.toLocaleString('id-ID')}</td>
                      <td className="p-3">{item.periode}</td>
                      <td className="p-3">{item.keterangan || '-'}</td>
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Tambah/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Biaya Penyimpanan' : 'Tambah Biaya Penyimpanan'}
            </DialogTitle>
            <DialogDescription>
              Isi form di bawah untuk {editingItem ? 'mengubah' : 'menambahkan'} biaya penyimpanan
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="bahanBaku">Bahan Baku</Label>
                <select
                  id="bahanBaku"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={formData.bahanBakuId}
                  onChange={(e) => setFormData({ ...formData, bahanBakuId: e.target.value })}
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
                <Label htmlFor="biayaPerUnit">Biaya Penyimpanan per Unit per Tahun (Rp)</Label>
                <Input
                  id="biayaPerUnit"
                  type="number"
                  value={formData.biayaPerUnit}
                  onChange={(e) => setFormData({ ...formData, biayaPerUnit: Number(e.target.value) })}
                  min="0"
                  placeholder="Contoh: 2500"
                  required
                />
                <p className="text-gray-500">Biaya untuk menyimpan 1 unit bahan dalam 1 tahun</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="periode">Periode</Label>
                <Input
                  id="periode"
                  value={formData.periode}
                  onChange={(e) => setFormData({ ...formData, periode: e.target.value })}
                  placeholder="Contoh: 2024, Q1 2024, Januari-Juni 2024"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keterangan">Keterangan</Label>
                <Input
                  id="keterangan"
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  placeholder="Catatan tambahan (opsional)"
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
