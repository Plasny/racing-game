import { showJoinUI, hideJoinUI, id } from "/js/join.js";
import { addCar, delCar } from "./3d.js"; 

export function socketInit() {
    const socket = new WebSocket(
        `ws://${window.location.host}/display/ws`,
    );

    socket.onopen = function() {
        console.log("connected to server");
    };

    socket.onmessage = function(event) {
        const msg = JSON.parse(event.data);

        if (msg.type == "cfg" && msg.id == id) {
            console.log("controller connected");
            hideJoinUI();
        }

        if (msg.type == "cfg") {
            addCar(msg.id, msg.data.color);
        }

        if (msg.type == "cls" && msg.id == id) {
            console.log("controller disconnected");
            showJoinUI();
        }

        if (msg.type == "cls") {
            delCar(msg.id);
        }
    };

    socket.onclose = function(event) {
        if (event.wasClean) {
            console.log(
                `connection closed: [${event.code}] ${event.reason}`,
            );
        } else {
            console.log("connection died");
        }
    };

    socket.onerror = function(error) {
        console.log(`errer: ${error}`);
    };
}
