import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import KanaQuiz from './KanaQuiz'; // Correct import path
// ... other imports ...

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <KanaQuiz />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
