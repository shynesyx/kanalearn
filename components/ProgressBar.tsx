import React from 'react';
import { View, ProgressBarAndroid, Platform, StyleSheet, Text } from 'react-native';

interface Props {
  completed: number;
  total: number;
}

const ProgressBar: React.FC<Props> = ({ completed, total }) => {
  const progress = total > 0 ? completed / total : 0;
  const progressPercentage = Math.round(progress * 100);
  const progressText = `${completed} / ${total}`;

  return (
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
        </View>
      )}
      <View style={styles.progressTextInside}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>{progressText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressBarContainer: {
    width: '80%',
    height: 40,
    marginBottom: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarBackground: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "black",
    shadowRadius: 3,
    shadowOpacity: 1,
    shadowOffset: {
      width: 0.5,
      height: 0.5,
    }
  },
  progressBarFill: {
    backgroundColor: '#1EE403',
    height: '100%',
    borderRadius: 20,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    position: 'absolute',
    left: 0,
  },
  progressBar: {
    width: '100%',
    height: '100%',
  },
  progressTextInside: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default ProgressBar;