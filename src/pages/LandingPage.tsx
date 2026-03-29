import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Trophy, Users, Zap, ArrowRight, X, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '../App';
import { toast } from 'sonner';

export default function LandingPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login({ email, password });
        toast.success('Welcome back!');
      } else {
        await register({ email, password, displayName });
        await login({ email, password });
        toast.success('Account created successfully!');
      }
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        {/* Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-8 border border-primary/20">
            <Zap size={16} className="text-primary fill-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary font-headline">The Ultimate Learning Platform</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-headline font-black text-on-surface tracking-tighter leading-[0.9] mb-8">
            Master Any Topic <br />
            <span className="text-primary">Through Play.</span>
          </h1>
          
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            Join thousands of scholars testing their knowledge in quantum physics, philosophy, history, and more. Personalized quizzes, real-time stats, and a global leaderboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={() => setShowAuth(true)}
              className="group bg-primary text-on-primary px-10 py-5 rounded-3xl font-headline font-extrabold text-lg shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
            >
              Start Learning Now
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="text-on-surface font-headline font-bold text-lg px-8 py-4 rounded-3xl border-2 border-outline-variant/20 hover:bg-surface-container transition-all">
              Explore Quizzes
            </button>
          </div>
        </motion.div>

        {/* Stats Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl w-full"
        >
          {[
            { label: 'Active Scholars', value: '50k+', icon: Users },
            { label: 'Quizzes Created', value: '1.2k+', icon: Brain },
            { label: 'Avg. Score', value: '84%', icon: Zap },
            { label: 'Global Rank', value: '#1', icon: Trophy },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center p-6 bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm">
              <stat.icon size={24} className="text-primary mb-3" />
              <p className="text-2xl font-headline font-black text-on-surface">{stat.value}</p>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuth && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuth(false)}
              className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-surface p-8 rounded-[40px] shadow-2xl border border-outline-variant/10"
            >
              <button 
                onClick={() => setShowAuth(false)}
                className="absolute top-6 right-6 p-2 hover:bg-surface-container rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="mb-8">
                <h2 className="text-3xl font-headline font-black text-on-surface mb-2">
                  {isLogin ? 'Welcome Back' : 'Join The Polymath'}
                </h2>
                <p className="text-on-surface-variant font-medium">
                  {isLogin ? 'Sign in to continue your journey.' : 'Create an account to start learning.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-4">Display Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-outline" size={18} />
                      <input 
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-3xl py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                        placeholder="Your Name"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-4">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-outline" size={18} />
                    <input 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-3xl py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-4">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-outline" size={18} />
                    <input 
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-3xl py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button 
                  disabled={loading}
                  className="w-full bg-primary text-on-primary py-5 rounded-3xl font-headline font-extrabold text-lg shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                </button>
              </form>

              <div className="mt-8 text-center">
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm font-bold text-primary hover:underline"
                >
                  {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-outline-variant/10 bg-surface-container-low">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <h2 className="text-2xl font-black text-primary font-headline tracking-tighter">The Polymath</h2>
          <div className="flex gap-8 text-sm font-bold text-on-surface-variant">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
          </div>
          <p className="text-xs font-medium text-outline">© 2026 The Polymath. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
