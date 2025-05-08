import React from 'react';
import { StyleSheet, View, Text} from 'react-native';

interface Props {
    title: string,
    style?: object,
    onPress?: () => void
}

const Button = ({ title, style, onPress}: Props) => (
    <View>
        <Text style={[styles.button, style]} onPress={onPress}>{title}</Text>
    </View>
);

const styles = StyleSheet.create({
    button: {
        borderRadius: 20,
        backgroundColor: '#5A35DF',
        fontWeight: 'bold',
        color: '#ddd',
        margin: 'auto',
        padding: 10,
        width: 200,
        textAlign: 'center',
        fontSize: 30,
    } 
});

export default Button;
