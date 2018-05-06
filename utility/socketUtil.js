// ====================== This utility method sets up the socket objects to a userId in an object and other methods that may be useful =======

//TODO: MAYBE use socket rooms rather than this method to set sockets.

const setupIO = client => {
  client.on("loggedIn", userId => {
    setUpUsers(userId, client);
  });
  client.on("disconnect", data => {
    disconnectUser(client);
  });
};

let loggedInUsers = {};
let socketToUsernameMap = {};

const setUpUsers = (userId, client) => {
  if (!loggedInUsers[userId]) loggedInUsers[userId] = [client];
  else loggedInUsers[userId].push(client);
  socketToUsernameMap[client.id] = userId;
  console.log(loggedInUsers);
  console.log(socketToUsernameMap);
};

//FIXME: this doesn't work because disconnecting doesn't mean you'll get the userId
const disconnectUser = client => {
  const userId = socketToUsernameMap[client.id];
  if (userId && loggedInUsers[userId]) {
    loggedInUsers[userId] = loggedInUsers[userId].filter(socket => {
      return socket.id !== client.id;
    });
    if (loggedInUsers[userId].length <= 0) delete loggedInUsers[userId];
    delete socketToUsernameMap[client.id];
  }
};

module.exports = setupIO;
