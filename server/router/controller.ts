import Game from "../game.ts";
import { WsType } from "../types.ts";

function router(game: Game, url: string, req, server) {
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

export default router;
