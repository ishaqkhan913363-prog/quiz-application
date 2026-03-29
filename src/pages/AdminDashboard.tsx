import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import Layout from '../components/Layout';
import { motion } from 'motion/react';
import { 
  Users, 
  PlusCircle, 
  BarChart3, 
  Settings, 
  Trash2, 
  Edit3, 
  Search, 
  ChevronRight, 
  HelpCircle,
  Plus
} from 'lucide-react';
import { Quiz } from '../types';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
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

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      const res = await fetch(`/api/quizzes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setQuizzes(quizzes.filter(q => q.id !== id));
        toast.success("Quiz deleted successfully");
      } else {
        throw new Error("Failed to delete quiz");
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.error("Failed to delete quiz");
    }
  };

  if (!isAdmin) return <div>Access Denied</div>;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="font-headline font-bold text-3xl text-on-surface tracking-tight mb-2">Admin Dashboard</h2>
          <p className="text-on-surface-variant font-medium">Manage your quizzes and monitor performance.</p>
        </motion.div>
        
        <Link 
          to="/admin/quizzes"
          className="bg-primary text-on-primary px-8 py-4 rounded-2xl font-headline font-extrabold shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <PlusCircle size={20} />
          Create New Quiz
        </Link>
      </div>

      {/* Admin Stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Quizzes', value: quizzes.length, icon: HelpCircle, color: 'text-primary' },
          { label: 'Total Users', value: '1,240', icon: Users, color: 'text-secondary' },
          { label: 'Total Attempts', value: '8,432', icon: BarChart3, color: 'text-tertiary' },
          { label: 'System Health', value: '99.9%', icon: Settings, color: 'text-green-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 shadow-sm">
            <stat.icon className={`${stat.color} mb-4`} size={24} />
            <p className="text-2xl font-headline font-black text-on-surface">{stat.value}</p>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Quiz List Table */}
      <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
          <h3 className="font-headline font-bold text-xl">Manage Quizzes</h3>
          <div className="flex items-center bg-surface-container-low rounded-full px-4 py-2 w-64 border border-outline-variant/20">
            <Search size={16} className="text-outline mr-2" />
            <input 
              type="text" 
              placeholder="Filter quizzes..." 
              className="bg-transparent border-none focus:ring-0 text-sm w-full p-0 placeholder:text-outline"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-xs font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Quiz Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">Questions</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {quizzes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant font-medium">
                    No quizzes found. Create your first quiz to get started!
                  </td>
                </tr>
              ) : (
                quizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={quiz.imageUrl} 
                          alt={quiz.title} 
                          className="w-10 h-10 rounded-lg object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="font-bold text-sm">{quiz.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-on-surface-variant">{quiz.category}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        quiz.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {quiz.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-primary">{quiz.questionCount}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-outline hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(quiz.id)}
                          className="p-2 text-outline hover:text-error hover:bg-error/5 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}
