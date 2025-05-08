import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import Button from '@/components/Button';

const instructions = [
    "3-choice questions",
    "Automatic advancing if you are right",
    "3 seconds wait if not [Use wisely\uD83D\uDE0B]",
    "Streak of 10 updates progress bar",
    "Surprise awaits you at the end"
];


const Welcome = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);

    return (
        <LinearGradient
            style={styles.container}
            colors={["#8166E2", "#ABA1A1"]}
        >
            <Text style={styles.title}>
                Welcome
            </Text>

            <Text style={styles.welcomeMessage}>
                So ... Let's learn some <Text style={{ fontStyle: 'italic' }}>kana</Text>
            </Text>


            <Modal
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modal}>
                    <Text style={styles.philosophy}>
                        Repetition is key{"\n"}
                        One thing at a time{"\n"}
                    </Text>
                    <Text style={styles.instructions}>
                        {instructions.map((line, index) => (
                            <Text key={index}>
                                &#128151; {line}
                                {index < instructions.length - 1 && <Text>{'\n'}</Text>}
                            </Text>
                        ))}
                    </Text>
                    <Button title="OK" style={{...styles.button, ...styles.button2}} onPress={() => setIsModalVisible(false)} />
                </View>
            </Modal>

            <Link href="/KanaQuiz" replace asChild>
                <Button title="Let's Go!" style={{...styles.button, ...styles.goButton}} />
            </Link>

            <Button title="show me how" style={styles.button} onPress={() => setIsModalVisible(true)} />

        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        paddingLeft: 40,
        paddingRight: 40,
    },
    title: {
        paddingTop: 200,
        fontSize: 60,
        textAlign: "center",
        fontWeight: 100,
        color: '#fff',
    },
    welcomeMessage: {
        fontSize: 24,
        marginBottom: 20,
        marginTop: 20,
        fontWeight: 100,
        color: '#fff',
        textAlign: 'center'
    },
    instructions: {
        fontSize: 20,
        color: '#7C63C4',
        lineHeight: 35,
    },
    philosophy: {
        fontSize: 25,
        color: '#7C63C4',
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 50,
        fontStyle: 'italic',
        letterSpacing: 0.5,
    },
    button: {
        padding: 10,
        textAlign: 'center',
        width: 150,
        margin: "auto",
        marginTop: 10,
        fontSize: 16,
    },
    modal: {
        flex: 1,
        height: '100%',
        padding: 30,
        textAlign: 'center',
        backgroundColor: "ddd",
        alignItems: 'center',
        paddingTop: 100,
    },
    goButton: {
        height: 50,
        width: 250,
        borderRadius: 50,
        fontSize: 30,
        marginTop: 275,
        marginBottom: 30
    },
    button2: {
        marginTop: 200,
    }
});

export default Welcome;
