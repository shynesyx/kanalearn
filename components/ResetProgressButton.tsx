import React from 'react';
import { View, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  onReset: () => void;
}

const ResetDataButton: React.FC<Props> = ({ onReset }) => {
  const handleResetConfirmation = () => {
    Alert.alert(
      'Warning',
      'Are you sure you want to completely reset your learning progress? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive', // To visually indicate it's a destructive action
          onPress: handleResetData,
        },
      ]
    );
  };

  const handleResetData = async () => {
    try {
      await AsyncStorage.removeItem('kanaLearningData');
      Alert.alert('Success', 'Learning data has been reset.', [
        { text: 'OK', onPress: onReset },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to reset learning data.');
      console.error('Error resetting learning data:', error);
    }
  };

  return (
    <Button title="Reset Learning Data" onPress={handleResetConfirmation} />
  );
};

export default ResetDataButton;
