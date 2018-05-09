// ====================== This utility method sets up the socket objects to a userId in an object and other methods that may be useful =======
//CONSTANTS

const EMIT_CONSTANTS = {
  EMIT_GROUP_UPDATE: "groupUpdate",
  EMIT_GROUP_CREATE: "groupCreate",
  EMIT_GROUP_DELETE: "groupDelete",
  EMIT_TASK_UPDATE: "taskUpdate",
  EMIT_TASK_CREATE: "taskCreate",
  EMIT_TASK_DELETE: "taskDelete",
  EMIT_USER_UPDATE: "userUpdate"
};

//TODO: MAYBE use socket rooms rather than this method to set sockets.

const setupIO = client => {
  client.on("loggedIn", userId => {
    setUpUsers(userId, client);
  });
  client.on("disconnect", data => {
    disconnectUser(client);
  });
};

let loggedInUsers = {}; // this is an object that holds a userId to all of its corresponding sockets (if multiple browsers)
let socketToUsernameMap = {}; //this is to map a userId to a socket

/**
 * When a user connects, he will be placed into the LoggedInUsers Object that tracks a user ID to a Socket
 *
 * @param {any} userId
 * @param {any} client
 */
const setUpUsers = (userId, client) => {
  if (!loggedInUsers[userId]) loggedInUsers[userId] = [client];
  else loggedInUsers[userId].push(client);
  socketToUsernameMap[client.id] = userId;
};

/**
 * Finds and removes the socket that was just disconnected from the LoggedInUser and socketToUserMap
 *
 * @param {any} client
 */
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

// ======================== PUBLIC METHODS ==========================

//users will always be an ARRAY of userIds

const emitChange = (users, data, emitString) => {
  if (!EMIT_CONSTANTS.keys().find(emitString)) {
    throw new Error(
      "Emit string is not part of the constants available to use."
    );
    return;
  }

  for (user of users) {
    const userSockets = loggedInUsers[user];
    if (userSockets && userSockets.length > 0)
      for (socket of userSockets) {
        socket.emit(emitString, data);
      }
  }
};

module.exports = {
  setupIO,
  emitChange,
  EMIT_CONSTANTS
};
