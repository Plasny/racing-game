import QRCode from "qrcode";
import Game from "./game";

const IP = "192.168.206.180"; // FIXME: paweł
const PORT = 8080;

enum WsType {
  Display,
  UI,
  Controller,
}
enum MsgType {
  Config = "cfg",
  Action = "act",
}

const game = new Game();

const server = Bun.serve({
  port: PORT,
  async fetch(req, server) {
    const url = new URL(req.url).pathname;

    if (url === "/joincode") {
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

    if (url === "/ui") {
      if (server.upgrade(req, { data: { type: WsType.UI } })) {
        return;
      }

      return new Response("display ws upgrade failed", { status: 500 });
    }

    return new Response("not found", { status: 404 });
  },
  websocket: {
    open(ws) {
      if (ws.data.type === WsType.Display) {
        ws.subscribe("display-broadcast");

        console.log("display connected");
      } else if (ws.data.type === WsType.UI) {
        ws.subscribe("ui-broadcast");

        console.log("ui connected");
      } else if (ws.data.type === WsType.Controller) {
        const id = ws.data.id;
        const car = game.get(id);

        server.publish(
          "ui-broadcast",
          `<div id="players" hx-swap-oob="beforeend"><div id="player-${id}" style="color: ${car?.color};">${id} - ${car?.name}</div></div>`,
        );

        console.log("controller connected");
      }
    },
    message(ws, message: string) {
      if (ws.data.type === WsType.Controller) {
        const msg = JSON.parse(message);
        const id = ws.data.id;

        if (msg.type === MsgType.Config) {
          game.updateCar(id, msg.data);
          server.publish(
            "ui-broadcast",
            `<div id="player-${id}" style="color: ${msg.data.color};">${id} - ${msg.data.name}</div>`,
          );
        } else if (msg.type === MsgType.Action) {
          server.publish("display-broadcast", JSON.stringify(msg.data));
        }
      }
    },
    close(ws) {
      if (ws.data.type === WsType.Display) {
        ws.unsubscribe("display-broadcast");

        console.log("display disconnected");
      } else if (ws.data.type === WsType.UI) {
        ws.unsubscribe("ui-broadcast");

        console.log("ui disconnected");
      } else if (ws.data.type === WsType.Controller) {
        game.remove(ws.data.id);

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
    if (server.upgrade(req, { data: { type: WsType.Display } })) {
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
    const id = game.add();

    if (server.upgrade(req, { data: { type: WsType.Controller, id } })) {
      return;
    }

    return new Response("controller ws upgrade failed", { status: 500 });
  }

  return new Response("not found", { status: 404 });
}
