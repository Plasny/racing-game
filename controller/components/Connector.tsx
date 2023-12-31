import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableNativeFeedback,
  Vibration,
  View,
} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { useIsFocused } from '@react-navigation/native';

export default function Connector(
  { onScanned }: { onScanned: (data: string) => void },
) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  const isFocused = useIsFocused();
  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
    setScanned(false);
  }, [isFocused]);

  const [error, setError] = useState(null);
  useEffect(() => {
    if (hasPermission === null) {
      setError("Requesting for camera permission");
    } else if (hasPermission === false) {
      setError("No access to camera");
    } else {
      setError(null);
    }
  }, [hasPermission]);

  const handleConnect = async (url: string) => {
    const host = url.split("/")[0]
    setScanned(true);

    try {
      const isAvailable =
        (await (await fetch(`http://${host}/controller/ping`)).text()) ===
          "pong [available]";

      if (isAvailable) {
        Vibration.vibrate(100);
        onScanned("ws://" + url);
      } else {
        setError("Connection failed, the server is not available");
      }
    } catch (error) {
      console.log(error)
      setError("Connection failed, the server is not available");
    }
  };

  const [host, setHost] = useState("localhost:8080");

  return (
    <View style={s.container}>
      {error === null
        ? (
          <BarCodeScanner
            onBarCodeScanned={scanned
              ? undefined
              : ({ data }) => handleConnect(data)}
            style={s.container}
          />
        )
        : (
          <>
            <Text style={s.errorStyle}>
              {error}
            </Text>

            {hasPermission &&
              (
                <TouchableNativeFeedback
                  onPress={() => {
                    setError(null);
                    setScanned(false);
                  }}
                >
                  <View style={[s.btn]}>
                    <Text style={s.btnText}>Try again</Text>
                  </View>
                </TouchableNativeFeedback>
              )}
          </>
        )}

      <View style={[s.container, { backgroundColor: "#0009" }]}>
        <Text style={s.text}>Enter server address</Text>
        <TextInput
          style={s.textInput}
          value={host}
          onChangeText={setHost}
          keyboardType="url"
        />

        <TouchableNativeFeedback
          onPress={() => {
            handleConnect(host);
          }}
        >
          <View style={[s.btn]}>
            <Text style={s.btnText}>Connect</Text>
          </View>
        </TouchableNativeFeedback>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
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
  text: {
  },
  btnText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 20,
    padding: 20,
  },
  errorStyle: {
    color: "red",
    fontSize: 20,
    marginTop: 80,
    textAlign: "center",
  },
});
