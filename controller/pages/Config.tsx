import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableNativeFeedback,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import * as ScreenOrientation from "expo-screen-orientation";

export default function Config({ navigation, route }) {
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    });

    return unsubscribe;
  }, [navigation]);

  const [name, setName] = useState("");
  const [color, setColor] = useState("#fff");

  return (
    <View style={s.container}>
      <StatusBar style="dark" />

      <TextInput
        style={s.textInput}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[s.textInput, { color }]}
        value={color}
        onChangeText={setColor}
      />

      <TouchableNativeFeedback
        onPress={() => {
          route.params.ws.current.send(
            JSON.stringify({
              type: "cfg",
              data: { name: name || "unnamed", color },
            }),
          );
          navigation.navigate("controller", { ...route.params });
        }}
      >
        <View style={[s.btn]}>
          <Text style={s.btnText}>Connect</Text>
        </View>
      </TouchableNativeFeedback>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  textInput: {
    color: "#fff",
    paddingHorizontal: 10,
    borderColor: "#fff",
    borderWidth: 2,
    borderRadius: 5,
    marginTop: 5,
    fontSize: 20,
  },
  btnText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 20,
    padding: 20,
  },
});
