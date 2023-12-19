const PORT = 8080;

const server = Bun.serve({
  port: PORT,
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/display") {
      return new Response(Bun.file("./display/index.html"));
    }
    if (url.pathname === "/display/main.js") {
      return new Response(Bun.file("./display/main.js"));
    }
    if (url.pathname === "/display/three.js") {
      return new Response(
        Bun.file("./node_modules/three/build/three.module.js"),
      );
    }

    // upgrade the request to a WebSocket
    if (server.upgrade(req)) {
      return; // do not return a Response
    }

    return new Response("Upgrade failed :(", { status: 500 });
  },
  websocket: {
    open() {
      console.log("connection opened");
    },
    message(ws, message) {
      console.log(message);
      ws.send(message); // echo back the message
    },
    close() {
      console.log("connection closed");
    },
  },
});

console.log(`Listening on http://${server.hostname}:${server.port}`);
