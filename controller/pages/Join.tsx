import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import * as ScreenOrientation from "expo-screen-orientation";

import Connector from "../components/Connector";

// hides warnings
import { LogBox } from "react-native";
LogBox.ignoreLogs(["new NativeEventEmitter"]);

// TODO add user identification
// TODO add connnection using qr-code

export default function Join({ navigation }) {
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    });

    return unsubscribe;
  }, [navigation]);

  const [url, setUrl] = useState(null);

  /**
   * @type {React.Ref<WebSocket>}
   */
  const ws = useRef(null);

  useEffect(() => {
    if (!url) return;

    ws.current = new WebSocket(url);
    ws.current.onopen = () => {
      navigation.replace("config", { ws });
    };
    ws.current.onclose = () => {
      setUrl(null);
    };
  }, [url]);

  return (
    <View style={[s.container]}>
      <StatusBar style="dark" />

      <Connector onScanned={setUrl} />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
