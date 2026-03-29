import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import Layout from '../components/Layout';
import { motion } from 'motion/react';
import { Attempt } from '../types';
import { History, ChevronRight, Clock, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyQuizzes() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      if (!user) return;
      try {
        const res = await fetch('/api/attempts/me');
        if (res.ok) {
          const attemptData = await res.json();
          setAttempts(attemptData);
        }
      } catch (error) {
        console.error("Error fetching attempts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [user]);

  return (
    <Layout>
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h2 className="font-headline font-bold text-3xl text-on-surface tracking-tight mb-2">My Quiz History</h2>
        <p className="text-on-surface-variant font-medium">Review your past performance and track your growth.</p>
      </motion.section>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : attempts.length === 0 ? (
          <div className="bg-surface-container-lowest p-12 rounded-3xl text-center border border-outline-variant/10">
            <History size={48} className="text-outline mx-auto mb-4" />
            <p className="text-on-surface-variant font-bold">No quizzes attempted yet.</p>
            <Link to="/dashboard" className="text-primary font-bold mt-2 inline-block hover:underline">Start your first quiz</Link>
          </div>
        ) : (
          attempts.map((attempt, i) => (
            <motion.div 
              key={attempt.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-all group"
            >
              <Link to={`/result/${attempt.id}`} className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                    attempt.score >= 80 ? 'bg-green-100 text-green-700' :
                    attempt.score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {attempt.score}%
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-lg group-hover:text-primary transition-colors">{attempt.quizTitle}</h4>
                    <div className="flex items-center gap-4 text-xs font-semibold text-outline mt-1">
                      <span className="flex items-center gap-1"><Clock size={14} /> {Math.floor(attempt.timeSpent / 60)}m {attempt.timeSpent % 60}s</span>
                      <span className="flex items-center gap-1"><Trophy size={14} /> {attempt.correctAnswers}/{attempt.totalQuestions} Correct</span>
                      <span>{new Date(attempt.completedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={20} className="text-outline group-hover:text-primary transition-all group-hover:translate-x-1" />
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </Layout>
  );
}
