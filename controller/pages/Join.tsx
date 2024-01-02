import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import * as ScreenOrientation from "expo-screen-orientation";

import Connector from "../components/Connector";

// hides warnings
import { LogBox } from "react-native";
LogBox.ignoreLogs(["new NativeEventEmitter"]);

export default function Join({ navigation }) {
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    });

    return unsubscribe;
  }, [navigation]);

  const [conf, setConf] = useState(null);

  /**
   * @type {React.Ref<WebSocket>}
   */
  const ws = useRef(null);

  useEffect(() => {
    if (!conf) return;

    ws.current = new WebSocket(conf.url);
    ws.current.onopen = () => {
      navigation.replace("config", { ws, id: conf.id });
    };
    ws.current.onclose = () => {
      setConf(null);
    };
  }, [conf]);

  return (
    <View style={[s.container]}>
      <StatusBar style="dark" />

      <Connector onScanned={setConf} />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
