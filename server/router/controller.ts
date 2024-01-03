import { Server } from "bun";
import Game from "../game.ts";
import { WsType } from "../types.ts";
import { NextCarId } from "../State.ts";

function router(game: Game, url: string, req: Request, server: Server) {
  if (url === "/ping") {
    return new Response("pong [available]");
  }

  if (url === "/ws") {
    const s = new URL(req.url).searchParams;
    const id = s.get("id") || NextCarId();

    if (server.upgrade(req, { data: { type: WsType.Controller, id } })) {
      return;
    }

    return new Response("controller ws upgrade failed", { status: 500 });
  }

  return new Response("not found", { status: 404 });
}

export default router;
