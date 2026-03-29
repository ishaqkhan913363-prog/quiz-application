/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { UserProfile } from './types';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  History, 
  Trophy, 
  Settings as SettingsIcon, 
  PlusCircle, 
  LogOut, 
  Menu, 
  X, 
  Search, 
  BookOpen, 
  Brain, 
  BarChart3,
  User as UserIcon,
  ChevronRight,
  Clock,
  HelpCircle,
  Play,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// Context for Auth and User Profile
interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Components
const LoadingScreen = () => (
  <div className="fixed inset-0 bg-surface flex items-center justify-center z-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="font-headline font-bold text-primary animate-pulse">The Polymath</p>
    </div>
  </div>
);

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import QuizInterface from './pages/QuizInterface';
import ResultPage from './pages/ResultPage';
import AdminDashboard from './pages/AdminDashboard';
import QuizManagement from './pages/QuizManagement';
import MyQuizzes from './pages/MyQuizzes';
import Stats from './pages/Stats';
import Settings from './pages/Settings';

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setProfile(data.user);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials: any) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Login failed');
    }
    const data = await res.json();
    setUser(data.user);
    setProfile(data.user);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setProfile(null);
  };

  const register = async (data: any) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Registration failed');
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isAdmin: profile?.role === 'admin' || profile?.email === 'govindkethawath004@gmail.com',
      login,
      logout,
      register
    }}>
      <Router>
        <div className="min-h-screen bg-surface text-on-surface font-body antialiased">
          <Toaster position="top-center" richColors />
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
            <Route path="/my-quizzes" element={user ? <MyQuizzes /> : <Navigate to="/" />} />
            <Route path="/stats" element={user ? <Stats /> : <Navigate to="/" />} />
            <Route path="/settings" element={user ? <Settings /> : <Navigate to="/" />} />
            <Route path="/quiz/:quizId" element={user ? <QuizInterface /> : <Navigate to="/" />} />
            <Route path="/result/:attemptId" element={user ? <ResultPage /> : <Navigate to="/" />} />
            <Route path="/admin" element={profile?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />} />
            <Route path="/admin/quizzes" element={profile?.role === 'admin' ? <QuizManagement /> : <Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

