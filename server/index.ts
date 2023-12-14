const PORT = 8080;

const server = Bun.serve({
    port: PORT,
    fetch(req, server) {
        // upgrade the request to a WebSocket
        if (server.upgrade(req)) {
            return; // do not return a Response
        }

        return new Response("Upgrade failed :(", { status: 500 });
    },
    websocket: {
        open() {
            console.log("connection opened")
        },
        message(ws, message) {
            console.log(message)
            ws.send(message); // echo back the message
        },
        close() {
            console.log("connection closed")
        },
    }
});

console.log(`Listening on http://${server.hostname}:${server.port}`);
