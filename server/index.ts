import QRCode from "qrcode";

const IP = "192.168.204.239"; // FIXME paweł
const PORT = 8080;

const server = Bun.serve({
  port: PORT,
  async fetch(req, server) {
    const url = new URL(req.url);

    if (url.pathname === "/") {
      try {
        const qr = await QRCode.toDataURL(
          `${IP}:${server.port}`,
        );

        return new Response(`<img src="${qr}" />`, {
          headers: { "content-type": "text/html" },
        });
      } catch (e) {
        console.log("error while generating a qrcode", e);
        return new Response("Could not generate a qrcode", { status: 500 });
      }
    }

    if (url.pathname === "/ws") {
      // upgrade the request to a WebSocket
      if (server.upgrade(req)) {
        return; // do not return a Response
      }

      return new Response("Upgrade failed :(", { status: 500 });
    }

    return new Response("Not Found", { status: 404 });
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
