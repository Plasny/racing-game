import Game from "../game.ts";
import { MsgType, WsType } from "../types.ts";

function router(game: Game, url: string, req, server) {
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

const ws = {
  playerConnected: (server, id: number, config: any) => {
    server.publish(
      "display-broadcast",
      JSON.stringify({
        type: MsgType.Config,
        id,
        data: config,
      }),
    );
  },
  playerDisconnected: (server, id: number) => {
    server.publish(
      "display-broadcast",
      JSON.stringify({
        type: MsgType.Close,
        id,
      }),
    );
  },
  action: (server, id: number, action: any) => {
    server.publish(
      "display-broadcast",
      JSON.stringify({
        type: MsgType.Action,
        id,
        data: action,
      }),
    );
  },
};

export default router;
export { ws };
