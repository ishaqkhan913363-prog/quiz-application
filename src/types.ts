export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: 'user' | 'admin';
  level: number;
  xp: number;
  quizzesCompleted: number;
  avgScore: number;
  globalRank: number;
  createdAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // in minutes
  questionCount: number;
  imageUrl: string;
  createdBy: string;
  createdAt: string;
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

export interface Attempt {
  id: string;
  userId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // in seconds
  completedAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoURL: string;
  totalScore: number;
  quizzesCompleted: number;
}
