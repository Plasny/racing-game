import QRCode from "qrcode";
import Game from "./game.ts";
import { MsgType, WsType } from "./types.ts";
import displayRouter, { ws as Display } from "./router/display.ts";
import controllerRouter from "./router/controller.ts";
import uiRouter, { ws as Ui } from "./router/ui.ts";

const IP = "192.168.68.119"; // FIXME: paweł
const PORT = 8080;

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
  websocket: {
    open(ws) {
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
    message(ws, message: string) {
      if (ws.data.type === WsType.Controller) {
        const msg = JSON.parse(message);
        const id = ws.data.id;

        if (msg.type === MsgType.Config) {
          game.updateCar(id, msg.data);

          Ui.playerConnected(server, id, msg.data);
          Display.playerConnected(server, id, msg.data);
        } else if (msg.type === MsgType.Action) {
          Display.action(server, id, msg.data);
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
