import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableNativeFeedback, Vibration, View } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { useState, useEffect, useRef } from "react";
import * as ScreenOrientation from 'expo-screen-orientation';
import Wheel from './components/Wheel.js';
import Connector from './components/Connector';

// hides warnings
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['new NativeEventEmitter']);

// TODO add user identification
// TODO add connnection using qr-code

export default function App() {
    Accelerometer.setUpdateInterval(100)

    const [url, setUrl] = useState(null)
    const [on, setOn] = useState(false)
    const [connected, setConnected] = useState(false)
    const [subscription, setSubscription] = useState(null);
    const [{ x, y, z }, setData] = useState({
        x: 0,
        y: 0,
        z: 0,
    });
    const rotation = on ? getRotation(x, y, z) : 0
    const acceleration = on ? z : 0

    /**
     * @type {React.Ref<WebSocket>}
     */
    let ws = useRef(null);

    const subscribe = () => {
        setSubscription(Accelerometer.addListener(setData));
    };

    const unsubscribe = () => {
        subscription && subscription.remove();
        setSubscription(null);
    };

    const connect = () => {
        ws.current = new WebSocket(url)
        ws.current.onopen = () => {
            setConnected(true)
        }
        ws.current.onclose = () => {
            setConnected(false)
        }
    }

    useEffect(() => {
        if (url === null && connected) {
            ws.current.close()
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
        } else if (url !== null && connected) {
            ws.current.close()
            connect()
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        } else if (url !== null && !connected) {
            connect()
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        }
    }, [url]);

    useEffect(() => {
        return () => {
            unsubscribe()
            ws.current.close()
        }
    }, []);

    useEffect(() => {
        if (on) {
            subscribe();
        } else {
            unsubscribe()
        }
    }, [on]);

    useEffect(() => {
        if (connected) {
            // console.log(rotation, acceleration)
            ws.current.send(JSON.stringify([rotation, acceleration]))
        }
    }, [rotation, acceleration])


    return (
        <View style={[s.container]} >
            <StatusBar style="dark" />

            {connected ? (
                <View style={{ flex: 1, flexDirection: "row" }}>
                    <View style={[s.col, { flex: 1 }]}>
                        <Wheel width={300} height={300} />
                        <Text style={s.absText}>{rotation}</Text>
                    </View>

                    <View style={s.col}>
                        <Text style={s.text}>acceleration: {padZeros(acceleration)}</Text>
                        <TouchableNativeFeedback
                            onPress={() => {
                                Vibration.vibrate(100)
                                setOn(!on)
                            }}
                        >
                            <View style={[s.btn, on ? { borderColor: '#aaa' } : null]}>
                                <Text style={s.btnText}>{on ? "Stop\nengine" : "Start\nengine"}</Text>
                            </View>
                        </TouchableNativeFeedback>

                        <TouchableNativeFeedback
                            onPress={() => {
                                Vibration.vibrate(100)
                                setUrl(null)
                            }}
                        >
                            <View style={[s.btn, { borderColor: '#aaa' }]}>
                                <Text style={s.btnText}>Disconnect</Text>
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                </View>
            ) : (
                <Connector onScanned={setUrl} />
            )}
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000'
    },
    col: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        margin: 50
    },
    text: {
        color: '#fff',
    },
    textInput: {
        color: '#fff',
        paddingHorizontal: 10,
        borderColor: '#fff',
        borderWidth: 2,
        borderRadius: 5,
        marginTop: 5,
        fontSize: 20,
    },
    absText: {
        position: 'absolute',
        alignSelf: 'center',
        color: '#fff',
        fontSize: 20,
    },
    btnText: {
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#222',
    },
    btn: {
        width: 100,
        height: 100,
        borderRadius: 100 / 2,
        backgroundColor: '#f00',
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#222',
        borderWidth: 5,
    }
});

function getRotation(x, y, z) {
    const rx = Math.round(x * 100) / 100;
    const ry = Math.round(y * 100) / 100;

    let rotation = Math.atan2(rx, ry) * 180 / Math.PI - 90

    if (rotation < -90 && rotation >= -180) {
        rotation = -90
    }

    if (rotation >= -270 && rotation <= -180) {
        rotation = 90
    }

    if (z >= 0.95) {
        rotation = 0
    }

    return Math.round(rotation);
}

function padZeros(n) {
    const myformat = new Intl.NumberFormat('en-US', {
        minimumIntegerDigits: 1,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return myformat.format(n)
}

