export interface QuizState {
    currentQuestion: Question | null;
    questionIndex: number;
    score: number;
    showScore: boolean;
    hasAnswered: boolean;
}

export interface Question {
    questionText: string;
    questionSound: any;
    correctAnswer: string;
    options: string[];
    targetKana: string;
}

export interface KanaLearningData {
    character: string;
    correctStreak: number;
    incorrectStreak: number;
    lastReviewed: Date | null;
    interval: number; // In milliseconds
    correctCount: number;
    incorrectCount: number;
    timeSpent: number; // In milliseconds
    isCompleted: boolean;
    targetSet: 'hiragana' | 'katakana' | 'dakuten' | 'yoon' | null;
}

export interface KanaCharacter {
  character: string;
  pronunciation: string;
  audio: any;
}



