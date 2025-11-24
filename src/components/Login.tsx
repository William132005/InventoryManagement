import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { auth, User } from '../lib/auth';
import { toast } from 'sonner@2.0.3';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = auth.login(username);
    if (user) {
      toast.success(`Selamat datang, ${user.nama}!`);
      onLogin(user);
    } else {
      toast.error('Username tidak ditemukan');
    }
  };

  const quickLogin = (username: string) => {
    const user = auth.login(username);
    if (user) {
      toast.success(`Selamat datang, ${user.nama}!`);
      onLogin(user);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4">
            <h1 className="text-purple-600">CV Mahameru Apparel</h1>
            <p className="text-gray-600 mt-1">Sistem Manajemen Persediaan Bahan Baku</p>
            <p className="text-gray-500">Malang, Jawa Timur</p>
          </div>
          <CardTitle>Login</CardTitle>
          <CardDescription>Masuk ke sistem dengan username Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
              <LogIn className="w-4 h-4 mr-2" />
              Masuk
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <p className="text-gray-600 mb-3">Demo Login:</p>
            <div className="space-y-2">
              <Button
                onClick={() => quickLogin('owner')}
                variant="outline"
                className="w-full justify-start"
              >
                <span className="text-purple-600 mr-2">👔</span>
                <div className="text-left">
                  <p>Bapak Hadi - Owner</p>
                  <p className="text-gray-500">Akses penuh semua fitur</p>
                </div>
              </Button>
              
              <Button
                onClick={() => quickLogin('admin')}
                variant="outline"
                className="w-full justify-start"
              >
                <span className="text-blue-600 mr-2">📦</span>
                <div className="text-left">
                  <p>Ibu Siti - Admin Gudang</p>
                  <p className="text-gray-500">Kelola stok & transaksi</p>
                </div>
              </Button>
              
              <Button
                onClick={() => quickLogin('produksi')}
                variant="outline"
                className="w-full justify-start"
              >
                <span className="text-green-600 mr-2">⚙️</span>
                <div className="text-left">
                  <p>Mas Budi - Staff Produksi</p>
                  <p className="text-gray-500">Input pengeluaran bahan</p>
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
