import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Question {
  questionText: string;
  correctAnswer: string;
  options: string[];
}

interface Props {
  question: Question;
  onAnswered: () => void;
  onCorrectAnswer: () => void;
  onIncorrectAnswer: (selectedAnswer: string) => void;
}

const ThreeChoiceQuestion: React.FC<Props> = ({
  question,
  onAnswered,
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

      onAnswered();

      setSelectedAnswer(answer);
      setIsAnswered(true);

      if (answer === question.correctAnswer) {
          setIsCorrect(true);
          setTimeout(()=>{
              console.log("correct");
              onCorrectAnswer();
          }, 1000);
      } else {
          setIsCorrect(false);
          setTimeout(()=>{
              console.log("incorrect");
              onIncorrectAnswer(answer);
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
   </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0)',
    marginBottom: 20,
  },
  questionText: {
    fontSize: 80,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    color: "#dfdfdf",
    textAlign: 'center',
    textShadowColor: 'black',
    textShadowOffset: {
      width: 2,
      height: 2,
    },
    textShadowRadius: 3,
  },
  optionsContainer: {
      alignItems: 'center',
  },
  optionButton: {
    backgroundColor: '#dfdfdf',
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom: 15,
    borderRadius: 40,
      width: '70%',
      marginBottom: 10,
    marginHorizontal: 5,
    marginVertical: 15,
    alignItems: 'center',
    shadowOpacity: .5,
    shadowColor: "black",
    shadowRadius: 3,
    shadowOffset: {
      width: 1.5,
      height: 2,
    }
  },
  optionText: {
    fontSize: 50,
    color: "#5A35DF",
  },
  selectedOptionText: {
    fontWeight: 'bold',
  },
  correctAnswer: {
    backgroundColor: '#1EE403',
  },
  incorrectAnswer: {
    backgroundColor: 'salmon',
  },
});

export default ThreeChoiceQuestion;
