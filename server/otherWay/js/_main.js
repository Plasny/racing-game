import { socketInit } from "./sockets.js";
import { join } from "./join.js";
import { graphicsInit } from "./3d.js";

await join();
socketInit();
graphicsInit();

