function init(onMessage) {
  const socket = new WebSocket(
    `ws://${window.location.host}/display/ws`,
  );

  socket.onopen = function (_e) {
    console.log("[open] Connection established");
    console.log("Sending to server");
  };

  socket.onmessage = function (event) {
    onMessage(event.data);
    // console.log(`[message] Data received from server: ${event.data}`);
  };

  socket.onclose = function (event) {
    if (event.wasClean) {
      console.log(
        `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`,
      );
    } else {
      // e.g. server process killed or network down
      // event.code is usually 1006 in this case
      console.log("[close] Connection died");
    }
  };

  socket.onerror = function (error) {
    console.log(`[error]`, error);
  };
}

export default init;
