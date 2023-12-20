import { StatusBar } from 'expo-status-bar';
import { Modal, StyleSheet, Text, TextInput, TouchableNativeFeedback, Vibration, View } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { useState, useEffect, useRef } from "react";
import Wheel from './components/Wheel.js';

// TODO add user identification
// TODO add connnection using qr-code

export default function App() {
    Accelerometer.setUpdateInterval(100)

    // const [url, setUrl] = useState("ws://127.0.0.1:8080/controller/ws")
    const [url, setUrl] = useState("ws://192.168.206.180:8080/controller/ws")
    const [showModal, setShowModal] = useState(false)
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
        <View style={[s.container, { backgroundColor: '#000' }]} >
            <StatusBar style="dark" />

            <Modal
                transparent={true}
                visible={showModal}
                animationType='fade'
                onRequestClose={() => setShowModal(false)}
            >
                <View style={[s.container, { backgroundColor: '#0009' }]}>
                    <Text style={s.text}>Enter server address</Text>
                    <TextInput
                        style={s.textInput}
                        value={url}
                        onChangeText={setUrl}
                        keyboardType='url'
                    />
                </View>
            </Modal>

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
                            if (connected)
                                ws.current.close()
                            else
                                connect()
                        }}
                        onLongPress={() => {
                            Vibration.vibrate(100)
                            setShowModal(true)
                        }}
                    >
                        <View style={[s.btn, connected ? { borderColor: '#aaa' } : null]}>
                            <Text style={s.btnText}>{connected ? "Disconnect" : "Connect"}</Text>
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
        alignItems: 'center',
        justifyContent: 'center',
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

