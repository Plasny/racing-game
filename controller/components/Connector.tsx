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

export default function Connector(
  { onScanned }: { onScanned: (data: string) => void },
) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleConnect = (host: string) => {
    setScanned(true);
    Vibration.vibrate(100);
    onScanned(`ws://${host}/ws`);
  };

  const [host, setHost] = useState("localhost:8080");

  return (
    <View style={s.container}>
      {hasPermission
        ? (
          <BarCodeScanner
            onBarCodeScanned={scanned
              ? undefined
              : ({ data }) => handleConnect(data)}
            style={s.container}
          />
        )
        : (
          <Text>
            {hasPermission === null
              ? "Requesting for camera permission"
              : "No access to camera"}
          </Text>
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
  btnText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 20,
    padding: 20,
  },
});
