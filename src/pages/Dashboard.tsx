import { useAuth } from '../App';
import Layout from '../components/Layout';
import { motion } from 'motion/react';
import { 
  History, 
  BarChart3, 
  Trophy, 
  Play, 
  Clock, 
  HelpCircle, 
  ChevronRight, 
  Brain,
  Zap,
  Star
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Quiz } from '../types';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { profile } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await fetch('/api/quizzes');
        if (res.ok) {
          const quizData = await res.json();
          setQuizzes(quizData);
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const stats = [
    { label: 'Quizzes Completed', value: profile?.quizzesCompleted || 0, icon: History, color: 'text-primary' },
    { label: 'Avg. Score', value: `${profile?.avgScore || 0}%`, icon: BarChart3, color: 'text-secondary' },
    { label: 'Global Rank', value: `#${profile?.globalRank || 412}`, icon: Trophy, color: 'text-tertiary' },
  ];

  return (
    <Layout>
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h2 className="font-headline font-bold text-3xl text-on-surface tracking-tight mb-2">
          Welcome back, {profile?.displayName?.split(' ')[0] || 'Alex'}.
        </h2>
        <p className="text-on-surface-variant font-medium">
          You've mastered 3 new topics this week. Ready for more?
        </p>
      </motion.section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/10 flex flex-col justify-between aspect-[16/9] md:aspect-square lg:aspect-video"
          >
            <stat.icon className={`${stat.color} w-8 h-8 mb-4`} />
            <div>
              <p className="text-3xl font-headline font-extrabold text-on-surface">{stat.value}</p>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Active Learning Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        <section className="lg:col-span-8">
          <div className="group relative overflow-hidden bg-primary p-8 rounded-3xl text-on-primary h-full min-h-[320px] flex flex-col justify-end shadow-2xl shadow-primary/20">
            <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4">
              <Brain size={160} />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full mb-6">
                <span className="w-2 h-2 rounded-full bg-surface-container-low animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-widest font-headline">Active Learning</span>
              </div>
              <h3 className="text-3xl font-headline font-bold mb-4 max-w-md">Quantum Mechanics & Particle Physics 101</h3>
              <div className="flex items-center justify-between mb-3 text-sm font-medium opacity-90">
                <span>Question 14 of 20</span>
                <span>70% Complete</span>
              </div>
              <div className="w-full bg-on-primary/20 h-2 rounded-full mb-8 overflow-hidden">
                <div className="bg-surface-container-low h-full rounded-full w-[70%] transition-all duration-700"></div>
              </div>
              <button className="bg-surface-container-lowest text-primary px-8 py-3 rounded-2xl font-bold font-headline hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center gap-2 w-fit">
                Resume Quiz
                <Play size={16} fill="currentColor" />
              </button>
            </div>
          </div>
        </section>

        <section className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-surface-container p-6 rounded-3xl flex-1 border border-outline-variant/10">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={20} className="text-primary fill-primary" />
              <h4 className="font-headline font-bold text-primary">Daily Challenge</h4>
            </div>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">Boost your streak! Complete today's logic puzzle to earn double XP.</p>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((_, i) => (
                  <img 
                    key={i}
                    src={`https://picsum.photos/seed/user${i}/100/100`} 
                    alt="user" 
                    className="w-8 h-8 rounded-full border-2 border-surface-container object-cover"
                    referrerPolicy="no-referrer"
                  />
                ))}
                <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-surface-container flex items-center justify-center text-[10px] font-bold text-primary">+12</div>
              </div>
              <span className="text-xs font-semibold text-on-surface-variant">Playing now</span>
            </div>
          </div>
          <div className="bg-tertiary/10 p-6 rounded-3xl border border-tertiary/20">
            <div className="flex items-center justify-between mb-2">
              <Star size={20} className="text-tertiary fill-tertiary" />
              <span className="text-xs font-bold text-tertiary font-headline uppercase tracking-widest">Mastery</span>
            </div>
            <p className="text-tertiary font-headline font-bold text-lg">World History</p>
            <p className="text-tertiary/70 text-sm mt-1">Next badge in 450 XP</p>
          </div>
        </section>
      </div>

      {/* Recommended Quizzes */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-headline font-extrabold text-2xl tracking-tight">Recommended for You</h3>
          <button className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
            View all 
            <ChevronRight size={16} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {quizzes.map((quiz, i) => (
            <motion.div 
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant/10 shadow-sm hover:shadow-xl transition-all"
            >
              <Link to={`/quiz/${quiz.id}`}>
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={quiz.imageUrl} 
                    alt={quiz.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-surface-container-high/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                      {quiz.difficulty}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="font-headline font-bold text-lg mb-2 group-hover:text-primary transition-colors">{quiz.title}</h4>
                  <p className="text-on-surface-variant text-sm mb-4 line-clamp-2">{quiz.description}</p>
                  <div className="flex items-center gap-4 text-xs font-semibold text-outline">
                    <span className="flex items-center gap-1"><Clock size={14} /> {quiz.timeLimit} min</span>
                    <span className="flex items-center gap-1"><HelpCircle size={14} /> {quiz.questionCount} Questions</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
