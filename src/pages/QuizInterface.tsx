import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Quiz, Question, Attempt } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, Brain, X } from 'lucide-react';
import { toast } from 'sonner';

export default function QuizInterface() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuizData = async () => {
      if (!quizId) return;
      try {
        const res = await fetch(`/api/quizzes/${quizId}`);
        if (!res.ok) {
          toast.error("Quiz not found");
          navigate('/dashboard');
          return;
        }
        
        const quizData = await res.json();
        setQuiz(quizData);
        setTimeLeft(quizData.timeLimit * 60);
        setQuestions(quizData.questions);
      } catch (error) {
        console.error("Error fetching quiz:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId, navigate]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || !quiz || !user) return;
    setIsSubmitting(true);

    let correctCount = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const timeSpent = (quiz.timeLimit * 60) - timeLeft;

    const attempt = {
      quizId: quiz.id,
      quizTitle: quiz.title,
      score,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      timeSpent,
    };

    try {
      const res = await fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attempt),
      });
      if (!res.ok) throw new Error('Failed to submit');
      const data = await res.json();
      toast.success("Quiz submitted successfully!");
      navigate(`/result/${data.id}`);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Failed to submit quiz");
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, quiz, user, questions, selectedAnswers, timeLeft, navigate]);

  useEffect(() => {
    if (loading || timeLeft <= 0) {
      if (timeLeft <= 0 && !loading) handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, handleSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Quiz Header */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-surface-container rounded-xl transition-all"
          >
            <X size={24} />
          </button>
          
          <div className="flex flex-col items-center">
            <h2 className="font-headline font-bold text-lg tracking-tight">{quiz?.title}</h2>
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Clock size={14} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary text-on-primary px-6 py-2 rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-surface-container overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-primary"
        />
      </div>

      {/* Quiz Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-8"
          >
            <div className="flex items-center gap-4">
              <span className="bg-primary/10 text-primary w-10 h-10 rounded-xl flex items-center justify-center font-bold font-headline">
                {currentQuestionIndex + 1}
              </span>
              <p className="text-xl font-bold font-headline leading-tight">
                {currentQuestion?.text}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {currentQuestion?.options.map((option, index) => {
                const isSelected = selectedAnswers[currentQuestionIndex] === index;
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: index }))}
                    className={`group flex items-center justify-between p-6 rounded-3xl border-2 transition-all text-left ${
                      isSelected 
                        ? 'bg-primary/5 border-primary text-primary shadow-lg shadow-primary/5' 
                        : 'bg-surface-container-lowest border-outline-variant/20 hover:border-primary/40'
                    }`}
                  >
                    <span className="font-medium">{option}</span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'border-primary bg-primary' : 'border-outline-variant/40'
                    }`}>
                      {isSelected && <CheckCircle2 size={14} className="text-on-primary" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant/10 px-6 py-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 font-bold text-outline hover:text-primary transition-all disabled:opacity-30"
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <div className="flex gap-2">
            {questions.map((_, i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentQuestionIndex ? 'bg-primary w-6' : 
                  selectedAnswers[i] !== undefined ? 'bg-primary/40' : 'bg-outline-variant/40'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (currentQuestionIndex === questions.length - 1) {
                handleSubmit();
              } else {
                setCurrentQuestionIndex(prev => prev + 1);
              }
            }}
            className="flex items-center gap-2 bg-primary/10 text-primary px-8 py-3 rounded-2xl font-bold hover:bg-primary hover:text-on-primary transition-all"
          >
            {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
            <ChevronRight size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
}
