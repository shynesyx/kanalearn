import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';
import ThreeChoiceQuestion from '@/components/ThreeChoiceQuestion';
import { KanaLearningData, Question, QuizState, KanaCharacter } from '@/data/types';
import { hiragana, katakana, hiraganaWithDakutenHandakuten, katakanaWithDakutenHandakuten, hiraganaYoon, katakanaYoon } from '@/data/kanaData';
import ResetDataButton from '@/components/ResetProgressButton';
import ProgressBar from '@/components/ProgressBar';
import { LinearGradient } from 'expo-linear-gradient'
import { Audio } from 'expo-av';
import Button from '@/components/Button';

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
    const startTime = useRef<number | null>(null);
    const elapsedTime = useRef<number | null>(null);
    const soundRef = useRef<Audio.Sound | null>(null);
    const totalKanaCount = allKana.length;

    const calculateElapsedTime = () => {
        if (startTime.current) {
            const now = Date.now();
            elapsedTime.current = now - startTime.current;
            startTime.current = null;
        } else {
            elapsedTime.current = 0;
        }
    };

    useEffect(() => {
        const now = Date.now();
        startTime.current = now;
        elapsedTime.current = null;
    }, [quizState.currentQuestion?.questionText]);

    // ignore the time spent on a character entirely when
    //   1. screen changes
    //   2. app exits or goes to background

    useEffect(() => {
        async function loadSound() {
            try {
                if (quizState.currentQuestion) {
                    console.log(quizState.currentQuestion.questionText);
                    const { sound } = await Audio.Sound.createAsync(
                        quizState.currentQuestion.questionSound
                    );
                    await Audio.setAudioModeAsync({
                        allowsRecordingIOS: false,
                        playsInSilentModeIOS: true,
                        shouldDuckAndroid: true,
                        playThroughEarpieceAndroid: false,
                    });
                    soundRef.current = sound;
                    console.log('Sound loaded successfully');
                }
            } catch (error) {
                console.error('Failed to load sound', error);
            }
        }

        loadSound();

        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, [quizState.currentQuestion?.questionText]);

    useEffect(() => {
       loadLearningData();
    }, [resetTrigger]);

    useEffect(() => {
        if (learningData.length > 0) {
            scheduleReviews();
            setLoading(false);
            setCompletedCount(learningData.filter(item => item.isCompleted).length);
        }
    }, [learningData]);

    const loadLearningData = async () => {
        try {
            const storedData = await AsyncStorage.getItem(LEARNING_DATA_KEY);
            if (storedData) {
                const parsedData: KanaLearningData[] = JSON.parse(storedData);
                const processedData: KanaLearningData[] = parsedData.map(item => ({
                    ...item,
                    lastReviewed: item.lastReviewed ? new Date(item.lastReviewed) : null,
                    interval: typeof item.interval === 'string' ? parseInt(item.interval, 10) : item.interval,
                    correctStreak: typeof item.correctStreak === 'string' ? parseInt(item.correctStreak, 10) : item.correctStreak,
                    incorrectStreak: typeof item.incorrectStreak === 'string' ? parseInt(item.incorrectStreak, 10) : item.incorrectStreak,
                    correctCount: typeof item.correctCount === 'string' ? parseInt(item.correctCount, 10) : item.correctCount,
                    incorrectCount: typeof item.incorrectCount === 'string' ? parseInt(item.incorrectCount, 10) : item.incorrectCount,
                    timeSpent: typeof item.timeSpent === "string" ? parseInt(item.timeSpent, 10) : item.timeSpent,
                    isCompleted: typeof item.isCompleted === 'string' ? item.isCompleted === 'true' : item.isCompleted,
                }));
                setLearningData(processedData);
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

    const determineTargetSet = (character: string): "hiragana" | "katakana" | "dakuten" | "yoon" | null => {
        if (hiragana.some(h => h.character === character)) {
            return "hiragana";
        }
        if (katakana.some(k => k.character === character)) {
            return "katakana";
        }
        if (hiraganaWithDakutenHandakuten.some(d => d.character === character) ||
            katakanaWithDakutenHandakuten.some(d => d.character === character)) {
            return "dakuten";
        }
        if (hiraganaYoon.some(y => y.character === character) ||
            katakanaYoon.some(y => y.character === character)) {
            return "yoon";
        }
        return null; // Or potentially another default value if appropriate
    };

    const initializeLearningData = () => {
        const initialData = allKana.map(kana => ({
            character: kana.character,
            correctStreak: 0,
            incorrectStreak: 0,
            lastReviewed: null,
            interval: 0, // Start with 0 interval for initial review
            correctCount: 0,
            incorrectCount: 0,
            timeSpent: 0,
            isCompleted: false,
            targetSet: determineTargetSet(kana.character),
        }));
        setLearningData(initialData);
    };

    const handleResetData = async () => {
        try {
            await AsyncStorage.removeItem(LEARNING_DATA_KEY);
            setLearningData([]); // Clear local state immediately
            setCompletedCount(0); // Reset the completed count
            setResetTrigger(prev => !prev); // Trigger a re-load (which will re-initialize if needed)
            // Reset quizState to its initial values
            setQuizState({
                currentQuestion: null,
                questionIndex: 0,
                score: 0,
                showScore: false,
                hasAnswered: false,
            });

            console.log('KanaQuiz: Success!! Learning data has been reset.');
        } catch (error) {
            console.error('KanaQuiz: Error resetting learning data:', error);
        }
    };

    const getActiveTargetSet = (): KanaLearningData[] => {
        let activeSet: KanaLearningData[] = [];
        const sets = ['hiragana', 'katakana', 'dakuten', 'yoon'];
        let i = 0;
        while (activeSet.length < 5) {
            activeSet = [...activeSet,
            ...learningData.filter(item => item.targetSet === sets[i] && !item.isCompleted)
            ];
            i++;
        }

        return activeSet;
    };

    const scheduleReviews = () => {
        const now = new Date().getTime();

        const activeSet = getActiveTargetSet();

        const itemsToReview = activeSet
            .filter(item => {
                // if (item.isCompleted) return false; // add to review list anyway even if it's marked complete
                if (!item.lastReviewed) return false; // bypass new items

                const nextReviewTime = new Date(item.lastReviewed.getTime() + item.interval);
                return nextReviewTime.getTime() <= now;
            })
            .map(item => allKana.find(k => k.character === item.character)!)
            .filter(Boolean);

        setCurrentReviewItems(itemsToReview);
    };

    const getNextQuestion = (): Question => {
        // first check for review items
        const reviewIndex = Math.floor(Math.random() * currentReviewItems.length);
        let nextKanaToReview = currentReviewItems && currentReviewItems[reviewIndex];

        // if nothing is scheduled for review at the current time, learn new characters
        if (!nextKanaToReview) {
            const activeSet = getActiveTargetSet();
            if (activeSet.length > 0) {
                // Introduce new characters from the current target set
                const newKana = activeSet.filter(item => item.lastReviewed === null);
                if (newKana.length > 0) {
                    const randomIndex = Math.floor(Math.random() * newKana.length);
                    // console.log("random index: ", randomIndex, ", new kana length: ", newKana.length);
                    nextKanaToReview = allKana.find(k => k.character === newKana[randomIndex].character)!;
                } else if (activeSet.length > 0) {
                    // If no new kana, review from the active set (should be covered by currentReviewItems)
                    const randomIndex = Math.floor(Math.random() * activeSet.length);
                    nextKanaToReview = allKana.find(k => k.character === activeSet[randomIndex].character)!;
                }
            }
        }

        return generateSingleQuestion(nextKanaToReview);
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
            questionSound: targetKana.audio,
            correctAnswer: correctPronunciation,
            options: options,
            targetKana: targetKana.character,
        };
    };

    useEffect(() => {
        if (!loading) {
            let next = getNextQuestion();
            // avoid same question twice in a row
            while (next.questionText === quizState.currentQuestion?.questionText) {
                next = getNextQuestion();
            }
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
        playSound();
        setQuizState(prevState => ({ ...prevState, hasAnswered: true }));
    };

    const updateLearningData = (kanaCharacter: string | undefined, isCorrect: boolean) => {
        if (!kanaCharacter) return;

        const exponentialFactor = 2;
        const oneMin = 60 * 1000; // 1 min

        setLearningData(prevData =>
            prevData.map(item => {
                if (item.character === kanaCharacter) {
                    const updatedItem = { ...item };
                    const now = new Date().getTime();
                    updatedItem.lastReviewed = new Date(now);

                    calculateElapsedTime();
                    updatedItem.timeSpent += elapsedTime.current ?? 0;

                    if (isCorrect) {
                        updatedItem.correctStreak++;
                        updatedItem.incorrectStreak = 0;
                        updatedItem.correctCount++;
                        // Exponential interval increase
                        if (updatedItem.interval === 0) {
                            updatedItem.interval = oneMin; // 1 minutes for the first correct
                        } else {
                            updatedItem.interval *= exponentialFactor;
                        }
                        // Completion rule
                        if (updatedItem.correctStreak >= 10 || updatedItem.interval > 10 * 24 * 60 * oneMin) { // 10 days
                            updatedItem.isCompleted = true;
                        }

                    } else {
                        updatedItem.correctStreak = 0;
                        updatedItem.incorrectStreak++;
                        // Interval decrease (reset to a smaller value)
                        updatedItem.interval = Math.max(oneMin, updatedItem.interval / exponentialFactor); // Min 1 minutes
                        updatedItem.incorrectCount++;
                        updatedItem.isCompleted = false; // Re-enable if incorrect
                    }

                    return updatedItem;
                }
                return item;
            })
        );
        saveLearningData();
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
                <Text>Loading Learning Data...</Text>
            </View>
        );
    }

    const playSound = async () => {
        if (soundRef.current) {
            try {
                await soundRef.current.playAsync();
                console.log('Playing sound');
            } catch (error) {
                console.error('Failed to play sound', error);
            }
        }
    };

    if (quizState.currentQuestion) {
        return (
            <LinearGradient colors={["#8166E2", "#ABA1A1"]} style={styles.container}>
                {
                    totalKanaCount === completedCount
                        ? <View style={styles.nextContainer}>
                            <Text style={styles.nextMessage}>Wow!{"\n"}You've completed!</Text>
                            < Link href="./review" replace asChild>
                                <Button title="Next" style={styles.nextButton} />
                            </Link>
                        </View>
                        : <>
                            <ProgressBar completed={completedCount} total={totalKanaCount} />
                            <ThreeChoiceQuestion
                                question={quizState.currentQuestion}
                                onCorrectAnswer={() => handleCorrectAnswer(quizState.currentQuestion?.targetKana)}
                                onIncorrectAnswer={(selected) => handleIncorrectAnswer(quizState.currentQuestion?.targetKana, selected)}
                                onAnswered={handleAnswered}
                            />
                            <Text style={styles.questionNumber}>Question {quizState.questionIndex} (Reviewing: {currentReviewItems.length})</Text>
                            {/* <Button title="Next Question" onPress={nextQuestion} disabled={!quizState.hasAnswered} /> */}
                            < Link href="./review" replace asChild>
                                <Button title="Next" style={{ backgroundColor: "transparent", margin: 0, fontSize: 12, }} />
                            </Link>
                            <ResetDataButton onReset={handleResetData} />
                        </>
                }
            </LinearGradient >
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
        paddingTop: 80,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    questionNumber: {
        fontSize: 14,
        marginTop: '20%',
        color: 'gray',
    },
    nextContainer: {
        paddingTop: 200,
    },
    nextMessage: {
        textAlign: 'center',
        fontSize: 50,
        color: "white"
    },
    nextButton: {
        marginTop: 200,
        borderRadius: 25,
    }
});

export default KanaQuiz;
