import React, { useState } from 'react';
import { useAuth } from '../App';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  History, 
  Trophy, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X, 
  Search,
  Plus,
  Compass,
  BarChart2
} from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { profile, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItems = [
    { name: 'Explore', path: '/dashboard', icon: Compass },
    { name: 'My Quizzes', path: '/my-quizzes', icon: History },
    { name: 'Stats', path: '/stats', icon: BarChart2 },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  const adminNavItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Quizzes', path: '/admin/quizzes', icon: Plus },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-screen w-72 fixed left-0 top-0 flex-col py-8 gap-2 bg-slate-50 border-r border-outline-variant/20 z-50">
        <div className="px-8 mb-10">
          <h1 className="text-2xl font-black text-primary font-headline tracking-tighter">The Polymath</h1>
          {isAdmin && (
            <div className="mt-8 flex items-center gap-3 p-3 bg-primary/5 rounded-2xl border border-primary/10">
              <img 
                src={profile?.photoURL || 'https://picsum.photos/seed/admin/100/100'} 
                alt="Admin" 
                className="w-10 h-10 rounded-xl object-cover"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="font-headline font-bold text-xs">Admin Portal</p>
                <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">Quiz Master</p>
              </div>
            </div>
          )}
        </div>

        <nav className="flex flex-col gap-1 px-4">
          {(isAdmin ? adminNavItems : navItems).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-6 py-3 rounded-2xl font-headline text-sm font-bold transition-all ${
                  isActive 
                    ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                    : 'text-outline hover:bg-primary/5 hover:text-primary'
                }`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
          
          <button
            onClick={handleLogout}
            className="mt-4 flex items-center gap-4 px-6 py-3 rounded-2xl font-headline text-sm font-bold text-error hover:bg-error/5 transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 pb-24 md:pb-8">
        {/* Top Bar */}
        <header className="sticky top-0 w-full z-40 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/10">
          <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <button className="md:hidden text-primary p-2 rounded-xl hover:bg-primary/5">
                <Menu size={24} />
              </button>
              <h2 className="hidden md:block font-headline font-extrabold text-xl tracking-tight">
                {location.pathname.includes('admin') ? 'Admin Dashboard' : 'Knowledge Hub'}
              </h2>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center bg-surface-container-low rounded-full px-4 py-2 w-64 border border-outline-variant/20 focus-within:ring-2 ring-primary/20 transition-all">
                <Search size={16} className="text-outline mr-2" />
                <input 
                  type="text" 
                  placeholder="Search knowledge..." 
                  className="bg-transparent border-none focus:ring-0 text-sm w-full p-0 placeholder:text-outline"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold font-headline text-primary tracking-tight">Level {profile?.level || 1}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">
                    {profile?.role === 'admin' ? 'Scholar' : 'Learner'}
                  </p>
                </div>
                <img 
                  src={profile?.photoURL || 'https://picsum.photos/seed/user/100/100'} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full border-2 border-primary/10 object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white/80 backdrop-blur-lg z-50 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-outline-variant/5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center px-5 py-2 rounded-2xl transition-all ${
                isActive ? 'bg-primary/10 text-primary' : 'text-outline'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] uppercase tracking-widest font-bold mt-1">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* FAB */}
      {!isAdmin && (
        <button className="fixed right-6 bottom-24 md:bottom-8 bg-primary text-on-primary p-4 rounded-2xl shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all z-40">
          <Plus size={28} />
        </button>
      )}
    </div>
  );
}
