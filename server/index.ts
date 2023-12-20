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
    if (url.pathname === "/display/sockets.js") {
      return new Response(
        Bun.file("./display/sockets.js"),
      );
    }
    if (url.pathname === "/display/ws") {
      // upgrade the request to a WebSocket
      if (server.upgrade(req, { data: { isDisplay: true } })) {
        return; // do not return a Response
      }

      return new Response("Upgrade failed :(", { status: 500 });
    }

    if (url.pathname === "/controller/ws") {
      // upgrade the request to a WebSocket
      if (server.upgrade(req, { data: { isDisplay: false } })) {
        return; // do not return a Response
      }

      return new Response("Upgrade failed :(", { status: 500 });
    }

    return new Response("not found", { status: 404 });
  },
  websocket: {
    open(ws) {
      console.log("connection opened");

      if (ws.data.isDisplay) {
        ws.subscribe("display-broadcast");
        console.log("display connected");
      } else {
        console.log("controller connected");
      }
    },
    message(ws, message: string) {
      console.log(message);
      ws.send(message); // echo back the message

      server.publish("display-broadcast", message);
    },
    close(ws) {
      console.log("connection closed");

      if (ws.data.isDisplay) {
        ws.unsubscribe("display-broadcast");
        console.log("display disconnected");
      } else {
        console.log("controller disconnected");
      }
    },
  },
});

console.log(`Listening on http://${server.hostname}:${server.port}`);
