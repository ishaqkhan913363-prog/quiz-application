import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { Attempt } from '../types';
import Layout from '../components/Layout';
import { motion } from 'motion/react';
import { Trophy, Clock, CheckCircle2, XCircle, ArrowRight, Share2, RotateCcw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function ResultPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttempt = async () => {
      if (!attemptId) return;
      try {
        const res = await fetch(`/api/attempts/${attemptId}`);
        if (res.ok) {
          const data = await res.json();
          setAttempt(data);
        }
      } catch (error) {
        console.error("Error fetching attempt:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempt();
  }, [attemptId]);

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!attempt) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <p>Attempt not found</p>
    </div>
  );

  const data = [
    { name: 'Correct', value: attempt.correctAnswers },
    { name: 'Incorrect', value: attempt.totalQuestions - attempt.correctAnswers },
  ];
  const COLORS = ['#3525cd', '#dfe9fa'];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface-container-lowest rounded-3xl p-8 shadow-xl shadow-primary/5 border border-outline-variant/10 text-center mb-12"
        >
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy size={40} className="fill-primary/20" />
          </div>
          
          <h2 className="text-4xl font-headline font-black text-on-surface tracking-tighter mb-2">
            Quiz Completed!
          </h2>
          <p className="text-on-surface-variant font-medium mb-8">
            Great job on completing <span className="text-primary font-bold">{attempt.quizTitle}</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center">
              <p className="text-5xl font-headline font-black text-primary mb-1">{attempt.score}%</p>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Final Score</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-5xl font-headline font-black text-secondary mb-1">{attempt.correctAnswers}/{attempt.totalQuestions}</p>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Correct Answers</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-5xl font-headline font-black text-tertiary mb-1">{formatTime(attempt.timeSpent)}</p>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Time Spent</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-primary text-on-primary px-8 py-4 rounded-2xl font-headline font-extrabold shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all">
              <Share2 size={20} />
              Share Result
            </button>
            <Link 
              to={`/quiz/${attempt.quizId}`}
              className="bg-surface-container text-primary px-8 py-4 rounded-2xl font-headline font-extrabold flex items-center gap-2 hover:bg-primary/10 transition-all"
            >
              <RotateCcw size={20} />
              Try Again
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/10 shadow-sm">
            <h3 className="font-headline font-bold text-xl mb-6">Performance Summary</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-8 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-sm font-bold text-on-surface-variant">Correct</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-surface-container-high"></div>
                <span className="text-sm font-bold text-on-surface-variant">Incorrect</span>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/10 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-headline font-bold text-xl mb-6">Next Steps</h3>
              <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
                You're doing great! Based on your performance, we recommend exploring more advanced topics in {attempt.quizTitle.split(' ')[0]}.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-2xl">
                  <CheckCircle2 className="text-primary" size={24} />
                  <div>
                    <p className="font-bold text-sm">Review Mistakes</p>
                    <p className="text-xs text-on-surface-variant">See where you can improve</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-2xl">
                  <Trophy className="text-tertiary" size={24} />
                  <div>
                    <p className="font-bold text-sm">Unlock Mastery</p>
                    <p className="text-xs text-on-surface-variant">Complete 2 more quizzes</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Link 
              to="/dashboard"
              className="mt-8 flex items-center justify-center gap-2 text-primary font-headline font-bold hover:gap-3 transition-all"
            >
              Back to Dashboard
              <ArrowRight size={20} />
            </Link>
          </section>
        </div>
      </div>
    </Layout>
  );
}
