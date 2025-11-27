export type UserRole = 'owner' | 'admin-gudang' | 'staff-produksi';

export interface User {
  id: string;
  nama: string;
  role: UserRole;
  username: string;
}

const CURRENT_USER_KEY = 'current-user-mahameru';

// Data user dummy
const USERS: User[] = [
  {
    id: '1',
    nama: 'Bapak Hadi',
    role: 'owner',
    username: 'owner',
  },
  {
    id: '2',
    nama: 'Ibu Siti',
    role: 'admin-gudang',
    username: 'admin',
  },
  {
    id: '3',
    nama: 'Mas Budi',
    role: 'staff-produksi',
    username: 'produksi',
  },
];

export const auth = {
  login: (username: string): User | null => {
    const user = USERS.find(u => u.username === username);
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  isLoggedIn: (): boolean => {
    return !!auth.getCurrentUser();
  },

  hasPermission: (requiredRole: UserRole[]): boolean => {
    const user = auth.getCurrentUser();
    if (!user) return false;
    return requiredRole.includes(user.role);
  },
};

export const ROLE_LABELS: Record<UserRole, string> = {
  'owner': 'Owner',
  'admin-gudang': 'Admin Gudang',
  'staff-produksi': 'Staff Produksi',
};

// Permissions untuk setiap role
export const PERMISSIONS = {
  // Owner hanya bisa lihat dashboard, perhitungan EOQ/ROP, dan laporan
  owner: {
    dashboard: true,
    dataBahanBaku: false,
    transaksiPenerimaan: false,
    transaksiPengeluaran: false,
    biayaPenyimpanan: false,
    perhitungan: true,
    laporan: true,
  },
  // Admin Gudang bisa kelola semua data dan transaksi
  'admin-gudang': {
    dashboard: true,
    dataBahanBaku: true,
    transaksiPenerimaan: true,
    transaksiPengeluaran: true,
    biayaPenyimpanan: true,
    perhitungan: true,
    laporan: true,
  },
  // Staff Produksi bisa lihat dashboard dan input transaksi (penerimaan & pengeluaran)
  'staff-produksi': {
    dashboard: true,
    dataBahanBaku: false,
    transaksiPenerimaan: true,
    transaksiPengeluaran: true,
    biayaPenyimpanan: false,
    perhitungan: false,
    laporan: false,
  },
};
