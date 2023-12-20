import QRCode from "qrcode";

const IP = "192.168.206.180"; // FIXME: paweł
const PORT = 8080;

const server = Bun.serve({
  port: PORT,
  async fetch(req, server) {
    const url = new URL(req.url).pathname;

    if (url === "/") {
      try {
        const qr = await QRCode.toDataURL(
          `${IP}:${server.port}`,
        );

        return new Response(`<img src="${qr}" />`, {
          headers: { "content-type": "text/html" },
        });
      } catch (e) {
        console.log("error while generating a qrcode", e);
        return new Response("could not generate a qrcode", { status: 500 });
      }
    }

    if (url.startsWith("/display")) {
      return displayRouter(url.replace("/display", ""), req, server);
    }
    if (url.startsWith("/controller")) {
      return controllerRouter(url.replace("/controller", ""), req, server);
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

function displayRouter(url: string, req, server) {
  if (url === "") {
    return new Response(Bun.file("./display/index.html"));
  }
  if (url === "/main.js") {
    return new Response(Bun.file("./display/main.js"));
  }
  if (url === "/three.js") {
    return new Response(
      Bun.file("./node_modules/three/build/three.module.js"),
    );
  }
  if (url === "/sockets.js") {
    return new Response(
      Bun.file("./display/sockets.js"),
    );
  }

  if (url === "/ws") {
    if (server.upgrade(req, { data: { isDisplay: true } })) {
      return;
    }

    return new Response("display ws upgrade failed", { status: 500 });
  }

  return new Response("not found", { status: 404 });
}

function controllerRouter(url: string, req, server) {
  if (url === "/ping") {
    return new Response("pong [available]");
  }

  if (url === "/ws") {
    if (server.upgrade(req, { data: { isDisplay: false } })) {
      return;
    }

    return new Response("controller ws upgrade failed", { status: 500 });
  }

  return new Response("not found", { status: 404 });
}
