const WebSocketServer = require('websocket').server;
const http = require('http');

// A dictionary of connections - { sharecode: list of connections in the same room }
var connections = {};

const server = http.createServer((req, res) => {});
server.listen(9527, () => { console.log('Listening on port 9527'); });

// create the server
ws = new WebSocketServer({
  httpServer: server
});

const originAllowed = origin => {
  console.log(origin);
  return true;
};

const getSpareRoom = () => {
  return 'jcv9';
};

const ShareCode = code => {
  return JSON.stringify({
    type: 'shareCode',
    payload: {
      code: code
    }
  });
};

const Message = (message, time) => {
  return JSON.stringify({
    type: 'message',
    payload: {
      message: message,
      time: time
    }
  });
};

const broadcast = (code, message) => {
  console.log(code);
  console.log(connections);
  let room = connections[code];
  if (room === undefined) {
    console.log('Invalid code');
    return;
  }
  let currentTime = Date();
  let copyRoom = [...room];
  copyRoom.forEach(connection => {
    if (connection.state === 'closed') {
      let index = room.indexOf(connection);
      if (index > -1) {
        room.splice(index, 1);
      }
    } else {
      connection.sendUTF(Message(message, currentTime));
    }
  });
}

// WebSocket server
ws.on('request', function(request) {
  if (!originAllowed(request.origin)) {
    request.reject();
    console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
    return;
  }
  let connection = request.accept(null, request.origin);

  let code = getSpareRoom();
  let room = connections[code];
  if (room !== undefined) {
    room.push(connection);
  } else {
    connections[code] = [connection];
  }

  connection.sendUTF(ShareCode(code));

  // This is the most important callback for us, we'll handle
  // all messages from users here.
  connection.on('message', function(data) {
    if (data.type === 'utf8') {
      let message = JSON.parse(data.utf8Data);
      switch (message.type) {
        case 'message':
          broadcast(message.payload.shareCode, message.payload.message)
          break;
        case 'shareCode':
          break;
        default:
          console.log('Got unexpected message: ', message);
          break;
      }
    }
  });

  connection.on('close', connection => {
    
  });
});
