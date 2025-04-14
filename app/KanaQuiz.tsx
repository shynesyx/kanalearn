import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import ThreeChoiceQuestion from '../components/ThreeChoiceQuestion'; // Adjust the path as needed
import { hiragana, katakana, KanaCharacter } from '../data/kanaData'; // Adjust the path as needed

interface QuizState {
  currentQuestion: Question | null;
  questionIndex: number;
  score: number;
  showScore: boolean;
}

interface Question {
  questionText: string;
  correctAnswer: string;
  options: string[];
}

const allKana = [...hiragana, ...katakana]; // Combine hiragana and katakana for the quiz

const KanaQuiz = () => {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: null,
    questionIndex: 0,
    score: 0,
    showScore: false,
  });
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    // Generate quiz questions when the component mounts
    generateQuestions(10); // Generate 10 questions (you can adjust this number)
  }, []);

  useEffect(() => {
    // Set the current question when questions are available
    if (questions.length > 0 && quizState.questionIndex < questions.length) {
      setQuizState(prevState => ({
        ...prevState,
        currentQuestion: questions[prevState.questionIndex],
      }));
    } else if (questions.length > 0 && quizState.questionIndex >= questions.length) {
      setQuizState(prevState => ({
        ...prevState,
        showScore: true,
        currentQuestion: null,
      }));
    }
  }, [questions, quizState.questionIndex]);

  const generateQuestions = (numberOfQuestions: number) => {
    if (allKana.length < 3) {
      console.warn('Not enough kana characters to generate 3-choice questions.');
      return;
    }

    const generatedQuestions: Question[] = [];
    const usedKana = new Set<string>();

    while (generatedQuestions.length < numberOfQuestions && usedKana.size < allKana.length) {
      const correctKana = allKana[Math.floor(Math.random() * allKana.length)];

      if (usedKana.has(correctKana.character)) {
        continue; // Ensure we don't use the same correct answer repeatedly in a short quiz
      }
      usedKana.add(correctKana.character);

      const incorrectOptions: string[] = [];
      while (incorrectOptions.length < 2) {
        const randomKana = allKana[Math.floor(Math.random() * allKana.length)];
        if (
          randomKana.pronunciation!== correctKana.pronunciation &&
          !incorrectOptions.includes(randomKana.pronunciation)
        ) {
          incorrectOptions.push(randomKana.pronunciation);
        }
      }

      const options = [...incorrectOptions, correctKana.pronunciation].sort(() => Math.random() - 0.5);

      generatedQuestions.push({
        questionText: `What is the pronunciation of "${correctKana.character}"?`,
        correctAnswer: correctKana.pronunciation,
        options: options,
      });
    }
    setQuestions(generatedQuestions);
  };

  const handleCorrectAnswer = () => {
    setQuizState(prevState => ({
      ...prevState,
      score: prevState.score + 1,
      questionIndex: prevState.questionIndex + 1,
    }));
  };

  const handleIncorrectAnswer = (selectedAnswer: string) => {
    setQuizState(prevState => ({
      ...prevState,
      questionIndex: prevState.questionIndex + 1,
    }));
    console.log(`Incorrect. Selected: ${selectedAnswer}, Correct: ${quizState.currentQuestion?.correctAnswer}`);
  };

  const resetQuiz = () => {
    setQuizState({
      currentQuestion: null,
      questionIndex: 0,
      score: 0,
      showScore: false,
    });
    generateQuestions(10);
  };

  if (quizState.showScore) {
    return (
      <View style={styles.container}>
        <Text style={styles.scoreText}>Your final score is: {quizState.score} / {questions.length}</Text>
        <Button title="Restart Quiz" onPress={resetQuiz} />
      </View>
    );
  }

  if (quizState.currentQuestion) {
    return (
      <View style={styles.container}>
        <ThreeChoiceQuestion
          question={quizState.currentQuestion}
          onCorrectAnswer={handleCorrectAnswer}
          onIncorrectAnswer={handleIncorrectAnswer}
        />
        <Text style={styles.questionNumber}>Question {quizState.questionIndex + 1} / {questions.length}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Loading quiz...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  questionNumber: {
    fontSize: 16,
    marginTop: 10,
    color: 'gray',
  },
});

export default KanaQuiz;
