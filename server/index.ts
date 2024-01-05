import QRCode from "qrcode";
import Game from "./game.ts";
import { MsgType, WsType } from "./types.ts";
import displayRouter, { ws as Display } from "./router/display.ts";
import controllerRouter from "./router/controller.ts";
import uiRouter, { ws as Ui } from "./router/ui.ts";
import type { ServerWebSocket } from "bun";
import { CARS, NextCarId, newCar, updateCar } from "./State.ts";

const PORT = 8080;
const IP = Object.values(require("os").networkInterfaces())
    .flat() // @ts-ignore
    .filter(addr => addr.family == "IPv4") // @ts-ignore
    .map(addr => addr.address)
    .filter(addr => addr != "127.0.0.1")
    .at(0);

console.log(IP);

const game = new Game();

const server = Bun.serve({
  port: PORT,
  async fetch(req, server) {
    const url = new URL(req.url).pathname;

    if (url === "/") {
        return new Response(Bun.file("otherWay/index.html"));
    }
    if (url === "/style.css") {
        return new Response(Bun.file("otherWay/style.css"));
    }
    if (url === "/js/_main.js") {
        return new Response(Bun.file("otherWay/js/_main.js"));
    }
    if (url === "/js/join.js") {
        return new Response(Bun.file("otherWay/js/join.js"));
    }
    if (url === "/js/sockets.js") {
        return new Response(Bun.file("otherWay/js/sockets.js"));
    }
    if (url === "/js/3d.js") {
        return new Response(Bun.file("otherWay/js/3d.js"));
    }
    if (url === "/js/three.js") {
      return new Response(
        Bun.file("./node_modules/three/build/three.module.js"),
      );
    }

    if (url == "/join" && req.headers.get("Accept") == "text/plain") {
        return new Response(NextCarId() + "");
    }
    if (url == "/join" && req.headers.get("Accept") == "text/svg+xml") {
      const id = new URL(req.url).searchParams.get("id") || NextCarId();

      try {
        const qr = await QRCode.toString(
          IP + ":" + PORT + "/controller/ws?id=" + id,
          { 
            type: "svg", 
            color: { light: "#0000" },
            errorCorrectionLevel: 'L',
          },
        );

        return new Response(qr, {
          headers: { "content-type": "text/svg+xml" },
        });
      } catch (e) {
        console.log("error while generating a qrcode", e);
        return new Response("could not generate a qrcode", { status: 500 });
      }
    }

    if (url === "/joincode") {
      const id = new URL(req.url).searchParams.get("id") || NextCarId();
      try {
        const qr = await QRCode.toDataURL(
          JSON.stringify({
            server: IP + ":" + PORT,
            id: id
          }),
        );

        return new Response(`
          <img src="${qr}" 
            hx-on:htmx:load="console.log('wait for connection with id:', ${id})"
          />
        `, {
          headers: { "content-type": "text/html" },
        });
      } catch (e) {
        console.log("error while generating a qrcode", e);
        return new Response("could not generate a qrcode", { status: 500 });
      }
    }

    if (url.startsWith("/display")) {
      return displayRouter(game, url.replace("/display", ""), req, server);
    }

    if (url.startsWith("/controller")) {
      return controllerRouter(
        game,
        url.replace("/controller", ""),
        req,
        server,
      );
    }

    if (url.startsWith("/ui")) {
      return uiRouter(
        game,
        url.replace("/ui", ""),
        req,
        server,
      );
    }

    return new Response("not found", { status: 404 });
  },

  // TODO add types for this 
  websocket: {
    open(ws: ServerWebSocket<{type: WsType}>) {
      if (ws.data.type === WsType.Display) {
        ws.subscribe("display-broadcast");

        console.log("display connected");
      } else if (ws.data.type === WsType.UI) {
        ws.subscribe("ui-broadcast");

        Ui.uiConnected(server, game.getCars());
        console.log("ui connected");
      } else if (ws.data.type === WsType.Controller) {
        console.log("controller connected");
      }
    },
    message(ws: ServerWebSocket<{type: WsType, id: number}>, message: string) {
      if (ws.data.type === WsType.Controller) {
        const msg = JSON.parse(message);
        const id = ws.data.id;

        if (msg.type === MsgType.Config) {
          game.updateCar(id, msg.data);

          newCar(id, msg.data.color, msg.data.name);
          Ui.playerConnected(server, id, msg.data);
          Display.playerConnected(server, id, msg.data);
        } else if (msg.type === MsgType.Action) {
          const car = updateCar(id, msg.data[0], msg.data[1])
          Display.action(server, id, car);
        }
      }
    },
    close(ws: ServerWebSocket<{type: WsType, id: number}>) {
      if (ws.data.type === WsType.Display) {
        ws.unsubscribe("display-broadcast");

        console.log("display disconnected");
      } else if (ws.data.type === WsType.UI) {
        ws.unsubscribe("ui-broadcast");

        console.log("ui disconnected");
      } else if (ws.data.type === WsType.Controller) {
        const id = ws.data.id;

        game.remove(id);

        Ui.playerDisconnected(server, id);
        Display.playerDisconnected(server, id);

        console.log("controller disconnected");
      }
    },
  },
});

console.log(`Listening on http://${server.hostname}:${server.port}`);
