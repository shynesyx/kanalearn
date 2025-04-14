import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, ProgressBarAndroid, Platform, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThreeChoiceQuestion from '../components/ThreeChoiceQuestion';
import { hiragana, katakana, hiraganaWithDakutenHandakuten, katakanaWithDakutenHandakuten, hiraganaYoon, katakanaYoon, KanaCharacter } from '../data/kanaData';
import ResetDataButton from '../components/ResetProgressButton';

// ... (QuizState and Question interfaces remain similar, but Question will need targetKana)

interface KanaLearningData {
  character: string;
  correctStreak: number;
  incorrectStreak: number;
  lastReviewed: Date | null;
  interval: number; // In milliseconds
  completionCount: number;
  isCompleted: boolean;
  targetSet: 'hiragana' | 'katakana' | 'dakuten' | 'yoon' | null;
}

const allKana = [...hiragana, ...katakana, ...hiraganaWithDakutenHandakuten, ...katakanaWithDakutenHandakuten, ...hiraganaYoon, ...katakanaYoon];
const hiraganaChars = hiragana.map(k => k.character);
const katakanaChars = katakana.map(k => k.character);
const dakutenChars = [...hiraganaWithDakutenHandakuten.map(k => k.character), ...katakanaWithDakutenHandakuten.map(k => k.character)];
const yoonChars = [...hiraganaYoon.map(k => k.character), ...katakanaYoon.map(k => k.character)];

const LEARNING_DATA_KEY = 'kanaLearningData';

const KanaQuiz = () => {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: null,
    questionIndex: 0,
    score: 0,
    showScore: false,
    hasAnswered: false,
  });
  const [learningData, setLearningData] = useState<KanaLearningData[]>([]);
  const [currentReviewItems, setCurrentReviewItems] = useState<KanaCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);
    const [resetTrigger, setResetTrigger] = useState(false);
  const totalKanaCount = allKana.length;

  useEffect(() => {
    loadLearningData();
  }, [resetTrigger]);

  useEffect(() => {
    if (learningData.length > 0) {
      scheduleReviews();
      setLoading(false);
    }
  }, [learningData]);

  useEffect(() => {
      if (learningData.length > 0) {
          setCompletedCount(learningData.filter(item => item.isCompleted).length);
      }
  }, [learningData]);

  const loadLearningData = async () => {
    try {
      const storedData = await AsyncStorage.getItem(LEARNING_DATA_KEY);
      if (storedData) {
        setLearningData(JSON.parse(storedData));
      } else {
        initializeLearningData();
      }
    } catch (error) {
      console.error('Failed to load learning data', error);
      initializeLearningData();
    }
  };

  const saveLearningData = async () => {
    try {
      await AsyncStorage.setItem(LEARNING_DATA_KEY, JSON.stringify(learningData));
    } catch (error) {
      console.error('Failed to save learning data', error);
    }
  };

  const initializeLearningData = () => {
    const initialData = allKana.map(kana => ({
      character: kana.character,
      correctStreak: 0,
      incorrectStreak: 0,
      lastReviewed: null,
      interval: 0, // Start with 0 interval for initial review
      completionCount: 0,
      isCompleted: false,
      targetSet: hiraganaChars.includes(kana.character) ? 'hiragana' :
                 katakanaChars.includes(kana.character) ? 'katakana' :
                 dakutenChars.includes(kana.character) ? 'dakuten' :
                 yoonChars.includes(kana.character) ? 'yoon' : null,
    }));
    setLearningData(initialData);
  };

    const handleResetData = async () => {
        try {
            await AsyncStorage.removeItem(LEARNING_DATA_KEY);
            setLearningData([]); // Clear local state immediately
            setCompletedCount(0); // Reset the completed count
            setResetTrigger(prev => !prev); // Trigger a re-load (which will re-initialize if needed)
            Alert.alert('Success', 'Learning data has been reset.');
        } catch (error) {
            Alert.alert('Error', 'Failed to reset learning data.');
            console.error('Error resetting learning data:', error);
        }
    };

  const getActiveTargetSet = (): KanaLearningData[] => {
    const completedHiragana = learningData.filter(item => item.targetSet === 'hiragana' && item.isCompleted).length === hiraganaChars.length;
    const completedKatakana = learningData.filter(item => item.targetSet === 'katakana' && item.isCompleted).length === katakanaChars.length;
    const completedDakuten = learningData.filter(item => item.targetSet === 'dakuten' && item.isCompleted).length === dakutenChars.length;

    if (!completedHiragana) return learningData.filter(item => item.targetSet === 'hiragana' && !item.isCompleted);
    if (!completedKatakana) return learningData.filter(item => item.targetSet === 'katakana' && !item.isCompleted);
    if (!completedDakuten) return learningData.filter(item => item.targetSet === 'dakuten' && !item.isCompleted);
    return learningData.filter(item => item.targetSet === 'yoon' && !item.isCompleted);
  };

  const scheduleReviews = () => {
    const now = new Date().getTime();
    const activeSet = getActiveTargetSet();

    const itemsToReview = activeSet
      .filter(item => {
        if (item.isCompleted) return false;
        if (!item.lastReviewed) return true; // Review new items

        const nextReviewTime = item.lastReviewed + item.interval;
        return nextReviewTime <= now;
      })
      .map(item => allKana.find(k => k.character === item.character)!)
      .filter(Boolean);

    setCurrentReviewItems(itemsToReview);
  };

  const getNextQuestion = (): Question | null => {
    const activeSet = getActiveTargetSet();
    if (currentReviewItems.length > 0) {
      const nextKanaToReview = currentReviewItems[Math.floor(Math.random() * currentReviewItems.length)];
      return generateSingleQuestion(nextKanaToReview);
    } else if (activeSet.length > 0) {
      // Introduce new characters from the current target set
      const newKana = activeSet.filter(item => item.lastReviewed === null);
      if (newKana.length > 0) {
        const randomNewKana = allKana.find(k => k.character === newKana[Math.floor(Math.random() * newKana.length)].character)!;
        return generateSingleQuestion(randomNewKana);
      } else if (activeSet.length > 0) {
        // If no new kana, review from the active set (should be covered by currentReviewItems)
        const randomIndex = Math.floor(Math.random() * activeSet.length);
        const randomKana = allKana.find(k => k.character === activeSet[randomIndex].character)!;
        return generateSingleQuestion(randomKana);
      }
    }
    return null; // No more characters to review in the current target set
  };

  const generateSingleQuestion = (targetKana: KanaCharacter): Question => {
    const correctPronunciation = targetKana.pronunciation;
    const incorrectOptions: string[] = [];
    const otherKanaInSet = getActiveTargetSet().filter(k => k.character !== targetKana.character);

    while (incorrectOptions.length < 2 && otherKanaInSet.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherKanaInSet.length);
      const randomKana = allKana.find(k => k.character === otherKanaInSet[randomIndex].character)!;
      if (!incorrectOptions.includes(randomKana.pronunciation) && randomKana.pronunciation !== correctPronunciation) {
        incorrectOptions.push(randomKana.pronunciation);
      }
      otherKanaInSet.splice(randomIndex, 1); // Ensure no duplicates from the same set
    }
    // If not enough incorrect options from the same set, fall back to all kana
    while (incorrectOptions.length < 2 && allKana.length > 0) {
      const randomIndex = Math.floor(Math.random() * allKana.length);
      const randomKana = allKana[randomIndex];
      if (!incorrectOptions.includes(randomKana.pronunciation) && randomKana.pronunciation !== correctPronunciation) {
        incorrectOptions.push(randomKana.pronunciation);
      }
    }

    const options = [...incorrectOptions, correctPronunciation].sort(() => Math.random() - 0.5);
    return {
      questionText: `${targetKana.character}`,
      correctAnswer: correctPronunciation,
      options: options,
      targetKana: targetKana.character,
    };
  };

  useEffect(() => {
    if (!loading) {
      const next = getNextQuestion();
      setQuizState(prevState => ({ ...prevState, currentQuestion: next, hasAnswered: false, questionIndex: prevState.questionIndex + 1 }));
    }
  }, [currentReviewItems, loading]);

  const handleCorrectAnswer = (answeredKana: string | undefined) => {
    if (!answeredKana) return;
    updateLearningData(answeredKana, true);
    setQuizState(prevState => ({ ...prevState, score: prevState.score + 1 }));
  };

  const handleIncorrectAnswer = (answeredKana: string | undefined, selectedAnswer: string) => {
    if (!answeredKana) return;
    updateLearningData(answeredKana, false);
    console.log(`Incorrect. Selected: ${selectedAnswer}, Correct: ${quizState.currentQuestion?.correctAnswer}`);
  };

  const handleAnswered = () => {
    setQuizState(prevState => ({ ...prevState, hasAnswered: true }));
  };

  const nextQuestion = () => {
    if (quizState.hasAnswered && quizState.currentQuestion) {
      scheduleReviews();
      const next = getNextQuestion();
      setQuizState(prevState => ({ ...prevState, currentQuestion: next, hasAnswered: false }));
    } else if (!quizState.hasAnswered) {
      alert('Please select an answer first.');
    }
  };

  const updateLearningData = (kanaCharacter: string | undefined, isCorrect: boolean) => {
    if (!kanaCharacter) return;

    setLearningData(prevData =>
      prevData.map(item => {
        if (item.character === kanaCharacter) {
          const updatedItem = { ...item };
          const now = new Date().getTime();
          updatedItem.lastReviewed = now;

          if (isCorrect) {
            updatedItem.correctStreak++;
            updatedItem.incorrectStreak = 0;
            updatedItem.completionCount++;
            // Exponential interval increase
            if (updatedItem.interval === 0) {
              updatedItem.interval = 5 * 60 * 60 * 1000; // 5 hours for the first correct
            } else {
              updatedItem.interval *= 2;
            }
            // Completion rule
            if (updatedItem.correctStreak >= 5 || updatedItem.interval > 5 * 60 * 60 * 1000) { // 5 hours
              updatedItem.isCompleted = true;
            }
          } else {
            updatedItem.correctStreak = 0;
            updatedItem.incorrectStreak++;
            // Interval decrease (reset to a smaller value)
            updatedItem.interval = Math.max(5 * 60 * 1000, updatedItem.interval / 2); // Min 5 minutes
            updatedItem.completionCount = 0;
            updatedItem.isCompleted = false; // Re-enable if incorrect
          }
          return updatedItem;
        }
        return item;
      })
    );
    saveLearningData();
    scheduleReviews();
  };

  const resetQuiz = () => {
    initializeLearningData();
    saveLearningData();
    scheduleReviews();
    setQuizState({ currentQuestion: null, questionIndex: 0, score: 0, showScore: false, hasAnswered: false });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading Learning Data...</Text>
      </View>
    );
  }

  if (quizState.showScore) {
    return (
      <View style={styles.container}>
        <Text style={styles.scoreText}>Quiz Finished!</Text>
        <Text>Your score: {quizState.score} / {quizState.questionIndex -1}</Text>
        <Button title="Restart Quiz" onPress={resetQuiz} />
      </View>
    );
  }

  if (quizState.currentQuestion) {
      const progress = completedCount / totalKanaCount;
      const progressPercentage = Math.round(progress * 100);
      const progressText = `${completedCount} / ${totalKanaCount}`;

      return (
          <View style={styles.container}>
              <View style={styles.progressBarContainer}>
                  {Platform.OS === 'android' ? (
                      <ProgressBarAndroid
                          styleAttr="Horizontal"
                          progress={progress}
                          indeterminate={false}
                          style={styles.progressBar}
                      />
                  ) : (
                      <View style={styles.progressBarBackground}>
                      <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
                      <View style={styles.progressTextInside}>
                          <Text style={{ color: 'white', fontWeight: 'bold' }}>{progressText}</Text>
                      </View>
                      </View>
                  )}
              </View>
              <ThreeChoiceQuestion
                  question={quizState.currentQuestion}
                  onCorrectAnswer={() => handleCorrectAnswer(quizState.currentQuestion?.targetKana)}
                  onIncorrectAnswer={(selected) => handleIncorrectAnswer(quizState.currentQuestion?.targetKana, selected)}
                  onAnswered={handleAnswered}
              />
              <Text style={styles.questionNumber}>Question {quizState.questionIndex} (Reviewing: {currentReviewItems.length})</Text>
              {/* <Button title="Next Question" onPress={nextQuestion} disabled={!quizState.hasAnswered} /> */}
              <ResetDataButton onReset={handleResetData} />
          </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Preparing your next review...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
      width: '100%',
      justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 40,
    marginBottom: 60,
      justifyContent: 'center',
      alignItems: 'center',
  },
  progressBarBackground: {
    backgroundColor: 'lightgray',
    borderRadius: 20,
      overflow: 'hidden',
    width: '100%', // Ensure it fills the container
    height: '100%', // Ensure it fills the container
    justifyContent: 'center', // Center text horizontally
    alignItems: 'center',    // Center text vertically
  },
  progressBarFill: {
    backgroundColor: 'green',
    height: '100%',
    borderRadius: 20,
      borderTopRightRadius: 0, // Remove top-right rounding
      borderBottomRightRadius: 0, // Remove bottom-right rounding
    position: 'absolute', // To control width independently
    left: 0,
  },
  progressTextInside: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  questionNumber: {
    fontSize: 14,
    marginTop: '30%',
    color: 'gray',
  },
});

export default KanaQuiz;
