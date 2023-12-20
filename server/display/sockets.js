function init(onMessage) {
  const socket = new WebSocket(
    `ws://${window.location.host}/display/ws`,
  );

  socket.onopen = function () {
    console.log("connected to server");
  };

  socket.onmessage = function (event) {
    onMessage(event.data);
  };

  socket.onclose = function (event) {
    if (event.wasClean) {
      console.log(
        `connection closed: [${event.code}] ${event.reason}`,
      );
    } else {
      console.log("connection died");
    }
  };

  socket.onerror = function (error) {
    console.log(`errer: ${error}`);
  };
}

export default init;
