import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import Layout from '../components/Layout';
import { motion } from 'motion/react';
import { Attempt } from '../types';
import { BarChart3, Trophy, Zap, TrendingUp, Calendar, Target } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export default function Stats() {
  const { user, profile } = useAuth();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      if (!user) return;
      try {
        const res = await fetch('/api/attempts/me');
        if (res.ok) {
          const attemptData = await res.json();
          setAttempts(attemptData.reverse().slice(0, 10));
        }
      } catch (error) {
        console.error("Error fetching attempts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [user]);

  const chartData = attempts.map(a => ({
    date: new Date(a.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: a.score
  }));

  if (chartData.length === 0) {
    // Mock data for visual
    chartData.push(
      { date: 'Mar 20', score: 65 },
      { date: 'Mar 22', score: 78 },
      { date: 'Mar 24', score: 82 },
      { date: 'Mar 26', score: 94 },
      { date: 'Mar 28', score: 88 }
    );
  }

  return (
    <Layout>
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h2 className="font-headline font-bold text-3xl text-on-surface tracking-tight mb-2">Performance Analytics</h2>
        <p className="text-on-surface-variant font-medium">Visualize your learning journey and mastery progress.</p>
      </motion.section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total XP', value: profile?.xp || 1250, icon: Zap, color: 'text-primary' },
          { label: 'Current Level', value: profile?.level || 24, icon: TrendingUp, color: 'text-secondary' },
          { label: 'Accuracy', value: `${profile?.avgScore || 94}%`, icon: Target, color: 'text-tertiary' },
          { label: 'Daily Streak', value: '12 Days', icon: Calendar, color: 'text-green-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 shadow-sm">
            <stat.icon className={`${stat.color} mb-4`} size={24} />
            <p className="text-2xl font-headline font-black text-on-surface">{stat.value}</p>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <section className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/10 shadow-sm">
          <h3 className="font-headline font-bold text-xl mb-8 flex items-center gap-2">
            <BarChart3 className="text-primary" size={24} />
            Score Progression
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3525cd" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3525cd" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfe9fa" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#777587' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#777587' }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    fontFamily: 'Manrope'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3525cd" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/10 shadow-sm">
          <h3 className="font-headline font-bold text-xl mb-8 flex items-center gap-2">
            <Trophy className="text-tertiary" size={24} />
            Skill Mastery
          </h3>
          <div className="space-y-6">
            {[
              { skill: 'Economics', progress: 85 },
              { skill: 'Philosophy', progress: 92 },
              { skill: 'Technology', progress: 64 },
              { skill: 'History', progress: 78 },
              { skill: 'Science', progress: 45 },
            ].map((skill, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-on-surface">{skill.skill}</span>
                  <span className="text-primary">{skill.progress}%</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.progress}%` }}
                    transition={{ delay: i * 0.1, duration: 1 }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
