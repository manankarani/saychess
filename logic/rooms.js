const { v4: uuidv4 } = require("uuid");
games = {};
let users_in_Q = [];
usernames_in_Q = [];
users_in_game = [];
function addInQ(user, socketid) {

  if (usernames_in_Q.includes(user)) {
    console.log(usernames_in_Q);
    return "already-waiting";
  }
  else if(users_in_game.includes(user))
  {
    console.log(usernames_in_Q);
      return "in-game"
  }
  else {
    users_in_Q.push([socketid, user]);
    usernames_in_Q.push(user);
    console.log(usernames_in_Q);
    console.log(users_in_Q);
    if (users_in_Q.length % 2 === 0) {
      newroom = uuidv4();
      createGame(newroom, users_in_Q.pop(), users_in_Q.pop());
      console.log(users_in_Q);
      return games[newroom];
    }
    return "user-added"
  }
  
}

function createGame(roomid, userW, userB) {
  games[roomid] = { B: userW, W: userB };
  console.log(games);
  users_in_game.push(userW[1]);
  users_in_game.push(userB[1]);
}

function gameOver(roomid) {
  delete games[roomid];
}

module.exports = {
  addInQ,
  createGame,
};
