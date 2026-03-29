import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import Layout from '../components/Layout';
import { motion } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Save, 
  ChevronLeft, 
  HelpCircle, 
  Image as ImageIcon,
  Clock,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { Quiz, Question } from '../types';
import { toast } from 'sonner';

export default function QuizManagement() {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<Omit<Quiz, 'id' | 'createdBy' | 'createdAt'>>({
    title: '',
    description: '',
    category: 'General',
    difficulty: 'medium',
    timeLimit: 10,
    questionCount: 0,
    imageUrl: 'https://picsum.photos/seed/quiz/800/600',
  });

  const [questions, setQuestions] = useState<Omit<Question, 'id' | 'quizId'>[]>([
    {
      text: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      explanation: ''
    }
  ]);

  const [isSaving, setIsSaving] = useState(false);

  const handleAddQuestion = () => {
    setQuestions([...questions, {
      text: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      explanation: ''
    }]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    if (field === 'text') newQuestions[index].text = value;
    if (field === 'correctAnswerIndex') newQuestions[index].correctAnswerIndex = value;
    if (field === 'explanation') newQuestions[index].explanation = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleSave = async () => {
    if (!isAdmin || !user) return;
    if (!quiz.title || questions.some(q => !q.text || q.options.some(o => !o))) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const quizData = {
        ...quiz,
        questionCount: questions.length,
        questions: questions // Send questions along with quiz data
      };

      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save quiz");
      }

      toast.success("Quiz created successfully!");
      navigate('/admin');
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save quiz");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAdmin) return <div>Access Denied</div>;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin')}
            className="p-2 hover:bg-surface-container rounded-xl transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="font-headline font-bold text-3xl text-on-surface tracking-tight">Create New Quiz</h2>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary text-on-primary px-8 py-4 rounded-2xl font-headline font-extrabold shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
        >
          <Save size={20} />
          {isSaving ? 'Saving...' : 'Save Quiz'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Quiz Details Form */}
        <section className="lg:col-span-1 space-y-8">
          <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/10 shadow-sm space-y-6">
            <h3 className="font-headline font-bold text-xl mb-4">Quiz Details</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Quiz Title</label>
              <input 
                type="text" 
                value={quiz.title}
                onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                placeholder="e.g. Quantum Physics 101"
                className="w-full bg-surface-container-low border-outline-variant/20 rounded-2xl px-4 py-3 focus:ring-2 ring-primary/20 transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Description</label>
              <textarea 
                value={quiz.description}
                onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                placeholder="Briefly describe what this quiz covers..."
                rows={4}
                className="w-full bg-surface-container-low border-outline-variant/20 rounded-2xl px-4 py-3 focus:ring-2 ring-primary/20 transition-all font-medium resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Difficulty</label>
                <select 
                  value={quiz.difficulty}
                  onChange={(e) => setQuiz({ ...quiz, difficulty: e.target.value as any })}
                  className="w-full bg-surface-container-low border-outline-variant/20 rounded-2xl px-4 py-3 focus:ring-2 ring-primary/20 transition-all font-medium"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Time Limit (min)</label>
                <input 
                  type="number" 
                  value={quiz.timeLimit}
                  onChange={(e) => setQuiz({ ...quiz, timeLimit: parseInt(e.target.value) })}
                  className="w-full bg-surface-container-low border-outline-variant/20 rounded-2xl px-4 py-3 focus:ring-2 ring-primary/20 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Image URL</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={quiz.imageUrl}
                  onChange={(e) => setQuiz({ ...quiz, imageUrl: e.target.value })}
                  className="flex-1 bg-surface-container-low border-outline-variant/20 rounded-2xl px-4 py-3 focus:ring-2 ring-primary/20 transition-all font-medium text-xs"
                />
                <div className="w-12 h-12 bg-surface-container-low rounded-xl flex items-center justify-center overflow-hidden border border-outline-variant/20">
                  <img src={quiz.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Questions Form */}
        <section className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="font-headline font-bold text-xl">Questions ({questions.length})</h3>
            <button 
              onClick={handleAddQuestion}
              className="text-primary font-bold text-sm flex items-center gap-2 hover:bg-primary/5 px-4 py-2 rounded-xl transition-all"
            >
              <Plus size={18} />
              Add Question
            </button>
          </div>

          <div className="space-y-8">
            {questions.map((q, qIndex) => (
              <motion.div 
                key={qIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/10 shadow-sm space-y-6 relative group"
              >
                <button 
                  onClick={() => handleRemoveQuestion(qIndex)}
                  className="absolute top-6 right-6 p-2 text-outline hover:text-error hover:bg-error/5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>

                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-primary/10 text-primary w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                    {qIndex + 1}
                  </span>
                  <input 
                    type="text" 
                    value={q.text}
                    onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                    placeholder="Enter your question here..."
                    className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-lg p-0 placeholder:text-outline/40"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-3">
                      <button 
                        onClick={() => handleQuestionChange(qIndex, 'correctAnswerIndex', oIndex)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          q.correctAnswerIndex === oIndex ? 'border-primary bg-primary' : 'border-outline-variant/40'
                        }`}
                      >
                        {q.correctAnswerIndex === oIndex && <CheckCircle2 size={14} className="text-on-primary" />}
                      </button>
                      <input 
                        type="text" 
                        value={option}
                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                        className={`flex-1 bg-surface-container-low border-outline-variant/20 rounded-2xl px-4 py-3 focus:ring-2 ring-primary/20 transition-all text-sm font-medium ${
                          q.correctAnswerIndex === oIndex ? 'ring-2 ring-primary/40' : ''
                        }`}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Explanation (Optional)</label>
                  <input 
                    type="text" 
                    value={q.explanation}
                    onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                    placeholder="Explain why the correct answer is right..."
                    className="w-full bg-surface-container-low border-outline-variant/20 rounded-2xl px-4 py-3 focus:ring-2 ring-primary/20 transition-all text-sm font-medium"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <button 
            onClick={handleAddQuestion}
            className="w-full py-8 border-2 border-dashed border-outline-variant/40 rounded-3xl text-outline hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col items-center gap-2"
          >
            <Plus size={32} />
            <span className="font-bold font-headline">Add Another Question</span>
          </button>
        </section>
      </div>
    </Layout>
  );
}
