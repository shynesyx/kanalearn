import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Question {
  questionText: string;
  correctAnswer: string;
  options: string[];
}

interface Props {
  question: Question;
  onCorrectAnswer: () => void;
  onIncorrectAnswer: (selectedAnswer: string) => void;
}

const ThreeChoiceQuestion: React.FC<Props> = ({
  question,
  onCorrectAnswer,
  onIncorrectAnswer,
}) => {
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    // Shuffle the options when the question changes
    const newOptions = [...question.options].sort(() => Math.random() - 0.5);
    setShuffledOptions(newOptions);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(null);
  }, [question]);

  const handleAnswer = (answer: string) => {
      if (isAnswered) {
          return; // Prevent further interaction after answering
      }

      setSelectedAnswer(answer);
      setIsAnswered(true);

      if (answer === question.correctAnswer) {
          setIsCorrect(true);
          setTimeout(()=>{
              console.log("correct");
              onCorrectAnswer();
          }, 500);
      } else {
          setIsCorrect(false);
          setTimeout(()=>{
              console.log("incorrect");
              onIncorrectAnswer();
          }, 3000);
      }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>{question.questionText}</Text>
      <View style={styles.optionsContainer}>
        {shuffledOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedAnswer === option && isAnswered
                ? isCorrect
                  ? styles.correctAnswer
                  : styles.incorrectAnswer
                : null,
              isAnswered && option === question.correctAnswer && styles.correctAnswer,
            ]}
            onPress={() => handleAnswer(option)}
            disabled={isAnswered}
          >
            <Text
              style={[
                styles.optionText,
                selectedAnswer === option && isAnswered && styles.selectedOptionText,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* {isAnswered && (
          <Text style={styles.feedbackText}>
          {isCorrect ? 'Correct!' : `Incorrect. The correct answer was: ${question.correctAnswer}`}
          </Text>
          )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
      width: '100%',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginBottom: 20,
  },
  questionText: {
    fontSize: 80,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  optionsContainer: {
      /* flexDirection: 'row',
       * justifyContent: 'space-around', */
      alignItems: 'center',
  },
  optionButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
      width: '80%',
      marginBottom: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 40,
  },
  selectedOptionText: {
    fontWeight: 'bold',
  },
  correctAnswer: {
    backgroundColor: 'green',
  },
  incorrectAnswer: {
    backgroundColor: 'red',
  },
  feedbackText: {
    marginTop: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ThreeChoiceQuestion;
