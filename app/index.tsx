import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Checkbox from 'expo-checkbox';
import Welcome from './welcome';
import KanaQuiz from './KanaQuiz';

export default function HomeScreen() {
    const [showWelcome, setShowWelcome] = useState<boolean>(true);
    const [doNotShowAgain, setDoNotShowAgain] = useState<boolean>(false);

    const fetchConfig = async () => {
        try {
            const storedConfig = await AsyncStorage.getItem('doNotShowWelcome');
            if (storedConfig !== null) {
                const parsedConfig = storedConfig === 'true'; // Convert string to boolean
                setDoNotShowAgain(parsedConfig);
                setShowWelcome(!parsedConfig); // Show Welcome if doNotShowAgain is false
            }
        } catch (error) {
            console.error('Error fetching config:', error);
        }
    };

    useEffect(() => {
        fetchConfig(); // Load stored preference on mount
    }, []);

    useEffect(() => {
        const saveConfig = async () => {
            try {
                await AsyncStorage.setItem('doNotShowWelcome', `${doNotShowAgain}`);
            } catch (error) {
                console.error('Error saving config:', error);
            }
        };
        saveConfig();
    }, [doNotShowAgain]); // Save when doNotShowAgain changes

    // Handle checkbox change
    const handleCheckboxChange = (newValue: boolean) => {
        setDoNotShowAgain(newValue);
        // setShowWelcome(!newValue); // Hide Welcome if checked
    };

    return (
        <View style={styles.container}>
            {showWelcome ? (
                <View style={styles.welcomeContainer}>
                    <Welcome />
                    <View style={styles.checkboxContainer}>
                        <Checkbox
                            value={doNotShowAgain}
                            onValueChange={handleCheckboxChange}
                            color={doNotShowAgain ? '#81b0ff' : undefined} // Blue when checked
                            style={styles.checkbox}
                            accessibilityLabel="Do not show welcome screen again"
                            accessibilityHint="Check to skip the welcome screen on future app loads"
                        />
                        <Text style={styles.checkboxLabel}>Do not show this again</Text>
                    </View>
                </View>
            ) : (
                <KanaQuiz />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    welcomeContainer: {
        alignItems: 'center',
        height: '100%',
        width: '100%',
    },
    checkboxContainer: {
        position: 'absolute',
        bottom: 30,
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 18,
        height: 18,
    },
    checkboxLabel: {
        fontSize: 16,
        marginLeft: 8,
        color: '#5A35DF',
    },
});
