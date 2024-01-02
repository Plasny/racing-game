import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  Vibration,
  View,
} from "react-native";
import { Accelerometer } from "expo-sensors";
import React, { useEffect, useState } from "react";
import * as ScreenOrientation from "expo-screen-orientation";
import Wheel from "../components/Wheel.js";

import { LogBox } from "react-native";
LogBox.ignoreLogs(["new NativeEventEmitter"]);

export default function Controller({ navigation, route }) {
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    });

    return unsubscribe;
  }, [navigation]);

  // Accelerometer.setUpdateInterval(100);
  Accelerometer.setUpdateInterval(1000);

  const [on, setOn] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [{ x, y, z }, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const rotation = on ? getRotation(x, y, z) : 0;
  const acceleration = on ? z : 0;

  /**
   * @type {React.Ref<WebSocket>}
   */
  const ws = route.params.ws;

  const subscribe = () => {
    setSubscription(Accelerometer.addListener(setData));
  };

  const unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      unsubscribe();
      ws.current.close();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (on) {
      subscribe();
    } else {
      unsubscribe();
    }
  }, [on]);

  useEffect(() => {
    // console.log(rotation, acceleration)
    ws.current.send(
      JSON.stringify({ type: "act", data: [rotation, acceleration] }),
    );
  }, [rotation, acceleration]);

  return (
    <View style={[s.container]}>
      <StatusBar style="dark" />

      <View style={{ flex: 1, flexDirection: "row" }}>
        <View style={[s.col, { flex: 1 }]}>
          <Wheel width={300} height={300} />
          <Text style={s.absText}>{rotation}</Text>
        </View>

        <View style={s.col}>
          <Text style={s.text}>acceleration: {padZeros(acceleration)}</Text>
          <TouchableNativeFeedback
            onPress={() => {
              Vibration.vibrate(100);
              setOn(!on);
            }}
          >
            <View style={[s.btn, on ? { borderColor: "#aaa" } : null]}>
              <Text style={s.btnText}>
                {on ? "Stop\nengine" : "Start\nengine"}
              </Text>
            </View>
          </TouchableNativeFeedback>

          <TouchableNativeFeedback
            onPress={() => {
              Vibration.vibrate(100);
              navigation.replace("join");
            }}
          >
            <View style={[s.btn, { borderColor: "#aaa" }]}>
              <Text style={s.btnText}>Disconnect</Text>
            </View>
          </TouchableNativeFeedback>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  col: {
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    margin: 50,
  },
  text: {
    color: "#fff",
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
  absText: {
    position: "absolute",
    alignSelf: "center",
    color: "#fff",
    fontSize: 20,
  },
  btnText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
    color: "#222",
  },
  btn: {
    width: 100,
    height: 100,
    borderRadius: 100 / 2,
    backgroundColor: "#f00",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#222",
    borderWidth: 5,
  },
});

function getRotation(x: number, y: number, z: number) {
  const rx = Math.round(x * 100) / 100;
  const ry = Math.round(y * 100) / 100;

  let rotation = Math.atan2(rx, ry) * 180 / Math.PI - 90;

  if (rotation < -90 && rotation >= -180) {
    rotation = -90;
  }

  if (rotation >= -270 && rotation <= -180) {
    rotation = 90;
  }

  if (z >= 0.95) {
    rotation = 0;
  }

  return Math.round(rotation);
}

function padZeros(n: number) {
  const myformat = new Intl.NumberFormat("en-US", {
    minimumIntegerDigits: 1,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return myformat.format(n);
}
