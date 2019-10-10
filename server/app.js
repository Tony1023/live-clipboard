const WebSocketServer = require('websocket').server;
const http = require('http');
const Map = require('hashmap');

// A dictionary of connections - { sharecode: list of connections in the same room }
var connections = {};
var shareCodes = new Map();

const server = http.createServer((req, res) => {});
server.listen(9527, () => { console.log('Listening on port 9527'); });

// create the server
ws = new WebSocketServer({
  httpServer: server
});

const originAllowed = origin => {
  return (origin === 'https://zhehao-lu.me' || origin === 'https://www.zhehao-lu.me');
};

const numberToString = number => {
  code = '';
  for (let i = 0; i < 4; ++i) {
    const component = number % 36;
    if (component < 10) {
      code += String(component);
    } else {
      code += String.fromCharCode(component + 55);
    }
    number = Math.floor(number /= 36);
  }
  return code;
}

const getSpareRoom = () => {
  let number = Math.floor(Math.random() * 1679616);
  let code = numberToString(number);
  while(connections[code] !== undefined) {
    ++number;
    if (number >= 1679616) {
      number = 0;
    }
    code = numberToString(number);
  } 
  return code;
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

const broadcast = (connection, message) => {
  let code = shareCodes.get(connection);
  let room = connections[code];
  if (room === undefined) {
    console.log('Invalid code');
    return;
  }
  let currentTime = Date();
  let copyRoom = [...room];
  copyRoom.forEach(connection => {
    connection.sendUTF(Message(message, currentTime));
  });
}

const joinWithCode = (connection, code) => {
  const room = connections[code];
  if (room !== undefined) {
    room.push(connection);
  } else {
    connections[code] = [connection];
  }
  shareCodes.set(connection, code);
}

const leave = connection => {
  const code = shareCodes.get(connection);
  const room = connections[code];
  const index = room.indexOf(connection);
  if (index > -1) {
    room.splice(index, 1);
  }
  if (room.length === 0) {
    delete connections[code];
    shareCodes.remove(connection);
  }
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
  joinWithCode(connection, code);
  connection.sendUTF(ShareCode(code));

  // This is the most important callback for us, we'll handle
  // all messages from users here.
  connection.on('message', data => {
    if (data.type === 'utf8') {
      let message = JSON.parse(data.utf8Data);
      switch (message.type) {
        case 'message':
          broadcast(connection, message.payload.message)
          break;
        case 'shareCode':
          leave(connection);
          joinWithCode(connection, message.payload.code);
          break;
        default:
          console.log('Got unexpected message: ', message);
          break;
      }
    }
  });

  connection.on('close', () => {
    console.log('Connection closed from ' + request.origin);
    leave(connection);
  });
});
