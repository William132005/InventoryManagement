import { useState, useEffect } from 'react';
import { Database, Package, ArrowLeftRight, Calculator, FileText, Home, LogOut, User, DollarSign } from 'lucide-react';
import { Button } from './components/ui/button';
import Dashboard from './components/Dashboard';
import DataBahanBaku from './components/DataBahanBaku';
import TransaksiPersediaan from './components/TransaksiPersediaan';
import BiayaPenyimpanan from './components/BiayaPenyimpanan';
import PerhitunganPersediaan from './components/PerhitunganPersediaan';
import Laporan from './components/Laporan';
import Login from './components/Login';
import { auth, ROLE_LABELS, PERMISSIONS } from './lib/auth';
import type { User as UserType } from './lib/auth';

type Page = 'dashboard' | 'data-bahan-baku' | 'transaksi' | 'biaya-penyimpanan' | 'perhitungan' | 'laporan';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  useEffect(() => {
    const user = auth.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    auth.logout();
    setCurrentUser(null);
  };

  const handleLogin = (user: UserType) => {
    setCurrentUser(user);
  };

  const canAccess = (page: Page): boolean => {
    if (!currentUser) return false;
    const permissions = PERMISSIONS[currentUser.role];
    
    switch (page) {
      case 'dashboard':
        return permissions.dashboard;
      case 'data-bahan-baku':
        return permissions.dataBahanBaku;
      case 'transaksi':
        return permissions.transaksiPenerimaan || permissions.transaksiPengeluaran;
      case 'biaya-penyimpanan':
        return permissions.biayaPenyimpanan;
      case 'perhitungan':
        return permissions.perhitungan;
      case 'laporan':
        return permissions.laporan;
      default:
        return false;
    }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-6">
          <h1 className="text-purple-600">CV Mahameru Apparel</h1>
          <p className="text-gray-600 mt-1">Sistem Manajemen Persediaan</p>
          <p className="text-gray-500 mt-1">Malang, Jawa Timur</p>
          
          {/* User Info */}
          <div className="mt-4 p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-purple-600" />
              <div className="flex-1">
                <p className="text-gray-900">{currentUser.nama}</p>
                <p className="text-purple-600">{ROLE_LABELS[currentUser.role]}</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="px-3 space-y-1">
          {canAccess('dashboard') && (
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                currentPage === 'dashboard'
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
          )}

          {canAccess('data-bahan-baku') && (
            <button
              onClick={() => setCurrentPage('data-bahan-baku')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                currentPage === 'data-bahan-baku'
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Database className="w-5 h-5" />
              <span>Data Bahan Baku</span>
            </button>
          )}

          {canAccess('transaksi') && (
            <button
              onClick={() => setCurrentPage('transaksi')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                currentPage === 'transaksi'
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ArrowLeftRight className="w-5 h-5" />
              <span>Transaksi Persediaan</span>
            </button>
          )}

          {canAccess('biaya-penyimpanan') && (
            <button
              onClick={() => setCurrentPage('biaya-penyimpanan')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                currentPage === 'biaya-penyimpanan'
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <DollarSign className="w-5 h-5" />
              <span>Biaya Penyimpanan</span>
            </button>
          )}

          {canAccess('perhitungan') && (
            <button
              onClick={() => setCurrentPage('perhitungan')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                currentPage === 'perhitungan'
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Calculator className="w-5 h-5" />
              <span>Perhitungan Persediaan</span>
            </button>
          )}

          {canAccess('laporan') && (
            <button
              onClick={() => setCurrentPage('laporan')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                currentPage === 'laporan'
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Laporan</span>
            </button>
          )}

          <div className="pt-4 mt-4 border-t">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start text-gray-700 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>Keluar</span>
            </Button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {currentPage === 'dashboard' && <Dashboard currentUser={currentUser} />}
        {currentPage === 'data-bahan-baku' && <DataBahanBaku currentUser={currentUser} />}
        {currentPage === 'transaksi' && <TransaksiPersediaan currentUser={currentUser} />}
        {currentPage === 'biaya-penyimpanan' && <BiayaPenyimpanan currentUser={currentUser} />}
        {currentPage === 'perhitungan' && <PerhitunganPersediaan />}
        {currentPage === 'laporan' && <Laporan />}
      </main>
    </div>
  );
}