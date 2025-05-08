import React from "react";
import { Stack } from "expo-router";
import { LogBox } from "react-native";

LogBox.ignoreAllLogs(true);

export default function RootLayout() {
  return <Stack>
      <Stack.Screen
          name="index"
          options={{ headerShown: false}}
      />
      <Stack.Screen
          name="KanaQuiz"
          options={{ headerShown: false}}
      />
     <Stack.Screen
          name="review"
          options={{ headerShown: false}}
      />
    </Stack>
}
