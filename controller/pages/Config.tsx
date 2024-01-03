import { StatusBar } from "expo-status-bar";
import {
    BackHandler,
  StyleSheet,
  Text,
  TextInput,
  TouchableNativeFeedback,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import * as ScreenOrientation from "expo-screen-orientation";

// hides warnings
import { LogBox } from "react-native";
LogBox.ignoreLogs(["new NativeEventEmitter"]);

export default function Config({ navigation, route }) {
  useEffect(() => {
      const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
          navigation.replace("join");
          return true;
      },
    );

    return () => backHandler.remove();
  }, [])
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    });

    return unsubscribe;
  }, [navigation]);

  const [name, setName] = useState("");
  const [color, setColor] = useState("#fff");
  const [okColor, setOkColor] = useState(true);

  useEffect(() => {
    setOkColor(/^(rgb|rgba)\(([0-9]{1,3}),\s*([0-9]{1,3}),\s*([0-9]{1,3})(,\s*\d+(\.\d+)?)?\)$/.test(color)
        || /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color))   
  }, [color])

  return (
    <View style={s.container}>
      <StatusBar style="dark" />

      <TextInput
        style={s.textInput}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={[s.textInput, okColor && { color }]}
        value={color}
        onChangeText={setColor}
      />

      { !okColor 
      ? <Text style={[s.btnText, {color: "red"}]}>Wrong color</Text>
      : <TouchableNativeFeedback
        onPress={() => {
          const data = JSON.stringify({
            type: "cfg",
            data: { 
              name: name || "unnamed", 
              color,
            },
          })
          route.params.ws.current.send(data);
          navigation.replace("controller", { ...route.params });
        }}
      >
        <View style={[s.btn]}>
          <Text style={s.btnText}>Connect</Text>
        </View>
      </TouchableNativeFeedback>
      }
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
  btn: {
  },
  btnText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 20,
    padding: 20,
  },
});

