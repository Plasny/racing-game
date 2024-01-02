import { Game } from "../game";
import { WsType } from "../types.ts";

function router(game: Game, url: string, req, server) {
  if (url === "") {
    if (server.upgrade(req, { data: { type: WsType.UI } })) {
      return;
    }

    return new Response("ui ws upgrade failed", { status: 500 });
  }
}

const ws = {
  uiConnected: (server, cars: any[]) => {
    server.publish(
      "ui-broadcast",
      `<div id="players" hx-swap-oob="beforeend">${
        cars.map(({ id, color, name }) =>
          `<div id="player-${id}" style="color: ${color};">${id} - ${name}</div>`
        ).join("")
      }</div>`,
    );
  },
  playerConnected: (server, id: number, config: any) => {
    server.publish(
      "ui-broadcast",
      `<div id="players" hx-swap-oob="beforeend"><div id="player-${id}" style="color: ${config.color};" onclick="track(${id})">${id} - ${config.name}</div></div>`,
    );
  },
  playerDisconnected: (server, id: number) => {
    server.publish(
      "ui-broadcast",
      `<div id="player-${id}"></div>`,
    );
  },
};

export default router;
export { ws };
