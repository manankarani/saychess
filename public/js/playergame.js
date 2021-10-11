// NOTE: this example uses the chess.js library:
// https://github.com/jhlywa/chess.js

var board = null;
var game = new Chess();
var $status = $("#status");
var $fen = $("#fen");
var $pgn = $("#pgn");
let currentPlayer = 2;
$(".loader").hide();

function onDragStart(source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false;
  if (
    (orientation === "white" && piece.search(/^w/) === -1) ||
    (orientation === "black" && piece.search(/^b/) === -1)
  ) {
    return false;
  }

  // only pick up pieces for the side to move
  if (
    (game.turn() === "w" && piece.search(/^b/) !== -1) ||
    (game.turn() === "b" && piece.search(/^w/) !== -1)
  ) {
    return false;
  }
}

function onDrop(source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: "q", // NOTE: always promote to a queen for example simplicity
  });

  // illegal move
  if (move === null) return "snapback";
  socket.emit("move", {
    color: oppn_info["my_color"],
    move: move.san,
    oppn_sockid: oppn_info["oppn"][0],
  });
  swapPlayer();
  updateStatus();
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd() {
  board.position(game.fen());
}

function updateStatus() {
  var status = "";

  var moveColor = "White";
  if (game.turn() === "b") {
    moveColor = "Black";
  }

  // checkmate?
  if (game.in_checkmate()) {
    status = "Game over, " + moveColor + " is in checkmate.";
  }

  // draw?
  else if (game.in_draw()) {
    status = "Game over, drawn position";
  }

  // game still on
  else {
    status = moveColor + " to move";

    // check?
    if (game.in_check()) {
      status += ", " + moveColor + " is in check";
    }
  }

  $status.html(status);
  $fen.html(game.fen());
  //$pgn.html(game.history().pop());
  move_count = game.history().length;
  addMovetoTable(game.history().pop(), game.turn(), move_count);
}

var config = {
  draggable: true,
  position: "start",
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
};

//updateStatus();

//pgnparsing

function addMovetoTable(move, color, length) {
  // First check if a <tbody> tag exists, add one if not
  if (length - 1 < 0) {
    return 0;
  }

  if ($("#pgnTable tbody").length == 0) {
    $("#pgnTable").append("<tbody></tbody>");
  }
  rowno = (length - 1) >> 1;

  // Append product to the table
  if (color === "b") {
    $("#pgnTable tbody").append(
      "<tr>" + "<td>" + move + "</td>" + "<td></td>" + "</tr>"
    );
  } else {
    var myTable = document.getElementById("pgnTable");
    myTable.rows[rowno + 1].cells[1].innerHTML = move;
  }
}

//game handler

const socket = io("ws://localhost:8000");
socket.on("msg", (arg) => {
  console.log(arg); // world
});

function load() {
  $(".loader").show();
  socket.emit("joingame", userinfo);
  $(".btn-play-cont").hide();
}
function start_game_gui() {
  board = document.getElementById("board");
  board.style.display = "block";
  board = Chessboard("board", config);
  $("#overlay").removeClass("d-flex").addClass("d-none");
  $(window).resize(board.resize);
  $(".loader").hide();
  
  startTimer();
}

var oppn_info = {};
var playerColor = "white";
socket.on("gameinfo", (userinfo) => {
  oppn_info = userinfo;
  console.log(userinfo["oppn"][1]);
  $(".oppn").text(userinfo["oppn"][1]);
  start_game_gui(userinfo);
  if (userinfo["my_color"] === "B") {
    board.flip();
    currentPlayer = 1
  } else {
    playerColor = "white";
  }
});
socket.on("playmove", (data) => {
  game.move(data["move"], {
    sloppy: true,
  });
  board.position(game.fen());
  swapPlayer();
  updateStatus();
});
socket.on("result", (result) => {
  if (result === "win") {
    console.log("WON");
  } else {
    console.log("LOST");
  }
});

//===============TIMER================
let playing = false;

const timerPanel = document.querySelector(".clock");
// Sound effects for project.
//const timesUp = new Audio('audio/460133__eschwabe3__robot-affirmative.wav');
//const click = new Audio('audio/561660__mattruthsound.wav');

// Add a leading zero to numbers less than 10.
const padZero = (number) => {
  if (number < 10) {
    return "0" + number;
  }
  return number;
};

// Create a class for the timer.
class Timer {
  constructor(player, minutes) {
    this.player = player;
    this.minutes = minutes;
  }
  getMinutes(timeId) {
    return document.getElementById(timeId).textContent;
  }
}

let p1time = new Timer("min1", document.getElementById("min1").textContent);
let p2time = new Timer("min2", document.getElementById("min2").textContent);

// Swap player's timer after a move (player1 = 1, player2 = 2).
const swapPlayer = () => {
  if (!playing) return;
  // Toggle the current player.
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  // Play the click sound.
  //click.play();
};

// Warn player if time drops below thirty seconds.

// Start timer countdown to zero.
const startTimer = () => {
  playing = true;
  let p1sec = 60;
  let p2sec = 60;

  let timerId = setInterval(function () {
    // Player 1.
    if (currentPlayer === 1) {
      if (playing) {
        // Disable start button.
        p1time.minutes = parseInt(p1time.getMinutes("min1"), 10);
        if (p1sec === 60) {
          p1time.minutes = p1time.minutes - 1;
        }
        p1sec = p1sec - 1;
        document.getElementById("sec1").textContent = padZero(p1sec);
        document.getElementById("min1").textContent = padZero(p1time.minutes);
        if (p1sec === 0) {
          // If minutes and seconds are zero stop timer with the clearInterval method.
          if (p1sec === 0 && p1time.minutes === 0) {
            // Play a sound effect.
            //timesUp.play();
            // Stop timer.
            clearInterval(timerId);
            
            playing = false;
          }
          p1sec = 60;
        }
      }
    } else {
      // Player 2.
      if (playing) {
        p2time.minutes = parseInt(p2time.getMinutes("min2"), 10);
        if (p2sec === 60) {
          p2time.minutes = p2time.minutes - 1;
        }
        p2sec = p2sec - 1;
        document.getElementById("sec2").textContent = padZero(p2sec);
        document.getElementById("min2").textContent = padZero(p2time.minutes);
        if (p2sec === 0) {
          // If minutes and seconds are zero stop timer with the clearInterval method.
          if (p2sec === 0 && p2time.minutes === 0) {
            // Play a sound effect.
            //timesUp.play();
            // Stop timer.
            clearInterval(timerId);
            playing = false;
          }
          p2sec = 60;
        }
      }
    }
  }, 1000);
};
