/* || CONSTANTS SECTION || */

// package for displaying large font
const asciiTextGenerator = require('ascii-text-generator');

// and readline-sync for console input
const readline = require("readline-sync");

// markers to indicate the status of each square
const EMPTY = ' ';
const COMPUTER = 'O';
const PLAYER = 'X';

// the flow of play will partly depend on options selected by the player
const GAME_OPTIONS = {
  difficultyLevel: null,
  gameType: null
};

// we'll need to track various values to track the state of a single game
// as well as a  best of 5 match
const GAME_STATE = {
  movesMade: 0,
  // the remaining properties are only used in the best of 5 version
  playerWins: 0,
  computerWins: 0,
  consecutiveTies: 0
};

// we'll use an object to represent the board for the convenience
// of numbering our squares 1 - 9 rather than 0 - 8
const GRID_SQUARES = {
  1: EMPTY,
  2: EMPTY,
  3: EMPTY,
  4: EMPTY,
  5: EMPTY,
  6: EMPTY,
  7: EMPTY,
  8: EMPTY,
  9: EMPTY,
};

// there are eight possible winning rows which we need to check after each move
// to see whether either player has won and to determine the computer's move if
// difficultyLevel is set to medium or hard
const WINNING_ROWS = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [1, 4, 7],
  [2, 5, 8],
  [3, 6, 9],
  [1, 5, 9],
  [3, 5, 7],
];

// any messages we want to display in a larger font go here
const bigMessages = {
  welcome: "tic tac toe",
  victory: "awesome you won",
  defeat: "darn you lost",
  tie: "it was a tie",
  goodbye: "thanks for playing"
};

// and any we want as normal text go here
const plainMessages = {
  chooseGameType: "Welcome player! Choose one of the following options:\n1) Single game\n2) Best of five\n",
  chooseDifficulty: "Please select one of the following difficulty levels:\n1) easy\n2) medium\n3) difficult\n",
  chooseSquare: "Please select ",
  confirmContinuePlay: `That's a lot of ties. Enter 'y' or 'yes' if you want to continue playing or anything else to quit. `,
  invalid: "I'm afraid that's not a valid choice. Please select one of the options listed above.\n"
};


/* || FUNCTIONS SECTION || */

/* GENERAL UTILITY FUNCTIONS */

// returns a random integer in the range 0 to max (both inclusive)
function getRandomInt(max) {
  let randomInt = Math.floor(Math.random() * (max + 1));
  return randomInt;
}

// given a list of items and the start of a sentence, adds items to end
// of sentence in a grammatically correct, comma-separated list
function makeCommaSeparatedList(items, sentenceStart) {
  items.forEach((opt, idx) => {
    if (idx === 0) {
      sentenceStart += ` ${opt}`;
    } else if (idx === items.length - 1) {
      sentenceStart += `, or ${opt}. `;
    } else {
      sentenceStart += `, ${opt}`;
    }
  });
  return sentenceStart + '\n';
}


/* FUNCTIONS FOR SELECTING CERTAIN SQUARES OR ROWS */

// return an array with the numbers of any currently empty squares
function getEmptySquares() {
  let squares = [];
  for (let square in GRID_SQUARES) {
    if (GRID_SQUARES[square] === EMPTY) {
      squares.push(square);
    }
  }
  return squares;
}

// gets all sub-arrays of WINNING_ROWS which already have two marks of either
// computer or player and one empty square and returns one of them
// or null if none is found
function getNearlyCompleteRow(playerOrComputer) {
  let nearlyCompleteRows = WINNING_ROWS.filter(winningRow => {
    let occupiedSquares = winningRow.filter(element =>
      GRID_SQUARES[element] === playerOrComputer);
    let emptySquares = winningRow.filter(element =>
      GRID_SQUARES[element] === EMPTY);
    return occupiedSquares.length === 2 && emptySquares.length === 1;
  });
  if (nearlyCompleteRows.length > 0) {
    let index = getRandomInt(nearlyCompleteRows.length - 1);
    return nearlyCompleteRows[index];
  }
  return null;
}

// gets all sub-arrays of WINNING_ROWS which have one mark by the computer
// and two empty squares (or null if none is found)
function getRowWithOneMark() {
  let onceMarkedRows = WINNING_ROWS.filter(winningRow => {
    let occupiedSquares = winningRow.filter(element =>
      GRID_SQUARES[element] === COMPUTER);
    let emptySquares = winningRow.filter(element =>
      GRID_SQUARES[element] === EMPTY);
    return occupiedSquares.length === 1 && emptySquares.length === 2;
  });
  if (onceMarkedRows.length > 0) {
    let index = getRandomInt(onceMarkedRows.length - 1);
    return onceMarkedRows[index];
  }
  return null;
}


/* FUNCTIONS FOR MARKING SELECTED SQUARES */

// randomly occupy an empty square on the board
// (by mutating the GRID_SQUARES object)
function markRandomSquare() {
  let squares = getEmptySquares();
  let index = getRandomInt(squares.length - 1);
  let square = squares[index];
  GRID_SQUARES[square] = COMPUTER;
}

// marks last empty square in the row passed as argument
function completeRow(row) {
  row.forEach((value) => {
    if (GRID_SQUARES[value] === EMPTY) {
      GRID_SQUARES[value] = COMPUTER;
    }
  });
}

// marks an empty square adjacent to a currently marked square
function addSecondMark(row) {
  let squareToMark = row.find(value => GRID_SQUARES[value] === EMPTY);
  GRID_SQUARES[squareToMark] = COMPUTER;
}


/* FUNCTIONS FOR SELECTING THE COMPUTER'S MOVE */

// in easy mode computer's move is always random
function computerMoveEasy() {
  markRandomSquare();
}

// in medium mode, computer will move to block completion of a winning row by
// player but otherwise will move randomly
function computerMoveMedium() {
  let rowToDefend = getNearlyCompleteRow(PLAYER);
  if (rowToDefend !== null) {
    completeRow(rowToDefend);
  } else {
    markRandomSquare();
  }
}

// in hard mode the computer will move first to complete a row if possible,
// then block player from completing a line,then occupy center square, then make
// two in a row in a row with no squares marked by player, then make random move
/* eslint-disable max-lines-per-function */
function computerMoveHard() {
  let rowToComplete = getNearlyCompleteRow(COMPUTER);
  let rowToBlock = getNearlyCompleteRow(PLAYER);
  let rowWithOneMark = getRowWithOneMark();

  switch (true) {
    case rowToComplete !== null:
      completeRow(rowToComplete);
      break;
    case rowToBlock !== null:
      completeRow(rowToBlock);
      break;
    case GRID_SQUARES[5] === EMPTY:
      GRID_SQUARES[5] = COMPUTER;
      break;
    case rowWithOneMark !== null:
      addSecondMark(rowWithOneMark);
      break;
    default:
      markRandomSquare();
  }
}
/* eslint-enable max-lines-per-function */

// the actual function called in the single game loop will invoke the
// appropriate computerMove function based on the selected difficulty level
// and increment the movesMade counter
function computerMove() {
  let level = GAME_OPTIONS.difficultyLevel;

  switch (level) {
    case 'easy':
      computerMoveEasy();
      break;
    case 'medium':
      computerMoveMedium();
      break;
    case 'hard':
      computerMoveHard();
  }
  GAME_STATE.movesMade += 1;
}


/* FUNCTIONS FOR GETTING PLAYER INPUT AND RECORDING PLAYER'S MOVES*/

// gets and returns player's choice of square to mark, prompting continuously
// until a valid selection is made
function getPlayerChoice() {
  let emptySquares = getEmptySquares();
  let prompt = plainMessages.chooseSquare;

  switch (emptySquares.length) {
    case 1:
      prompt += `${emptySquares[0]}.\n`;
      break;
    case 2:
      prompt += `${emptySquares[0]} or ${emptySquares[1]}.\n`;
      break;
    default:
      prompt = makeCommaSeparatedList(emptySquares, prompt);
  }
  prompt += "(Player marks with 'X'. Computer marks with 'O'.)\n";
  let choice = readline.question(prompt);
  while (!emptySquares.includes(choice)) {
    choice = readline.question(plainMessages.invalid);
  }
  return choice;
}

// updates the board with the player's selection
// and increments the movesMade counter
function playerMove() {
  let number = getPlayerChoice();
  GRID_SQUARES[number] = PLAYER;
  GAME_STATE.movesMade += 1;
}


/* FUNCTIONS FOR MONITORING AND MANIPULATING STATE OF GAME */

// resets properties of GAME_OPTIONS to null
function resetGameOptions() {
  for (let prop in GAME_OPTIONS) {
    GAME_OPTIONS[prop] = null;
  }
}

// resets properties of GAME_STATE to 0
function resetGameState() {
  for (let prop in GAME_STATE) {
    GAME_STATE[prop] = 0;
  }
}

// updates relevant properties of GAME_STATE after each match
// in a best of five game
function updateGameState(winner) {
  if (winner === 'player') {
    GAME_STATE.playerWins += 1;
    GAME_STATE.consecutiveTies = 0;
  }
  if (winner === 'computer') {
    GAME_STATE.computerWins += 1;
    GAME_STATE.consecutiveTies = 0;
  }
  if (winner === 'tie') {
    GAME_STATE.consecutiveTies += 1;
  }
}

// resets the bord
function resetBoard() {
  for (let prop in GRID_SQUARES) {
    GRID_SQUARES[prop] = EMPTY;
  }
}

// sets difficulty level based on player's selection
function setDifficultyLevel() {
  let choice = readline.question(plainMessages.chooseDifficulty);
  while (!['1', '2', '3'].includes(choice)) {
    choice = readline.question(plainMessages.invalid);
  }

  switch (choice) {
    case '1':
      GAME_OPTIONS.difficultyLevel = 'easy';
      break;
    case '2':
      GAME_OPTIONS.difficultyLevel = 'medium';
      break;
    case '3':
      GAME_OPTIONS.difficultyLevel = 'hard';
  }
}

// validates and returns user input when asked to choose game
function setGameType() {
  let choice = readline.question(plainMessages.chooseGameType);
  while (choice !== '1' && choice !== '2') {
    choice = readline.question(plainMessages.invalid);
  }

  switch (choice) {
    case '1':
      GAME_OPTIONS.gameType = 'single';
      break;
    case '2':
      GAME_OPTIONS.gameType = 'bestOfFive';
  }
}

// consolidates all the steps for setting up a new game
function setUpNewGame() {
  console.clear();
  displayLarge(bigMessages.welcome);
  resetGameOptions();
  resetGameState();
  setGameType();
  setDifficultyLevel();
}

// checks board to see if the most recent move produced a victor
// and returns true or false
function getWinner() {
  let winningRow = WINNING_ROWS.
    find(row => row.every(val => GRID_SQUARES[val] === COMPUTER) ||
    row.every(val => GRID_SQUARES[val] === PLAYER));

  if (winningRow !== undefined) {
    return true;
  }
  return false;
}

// checks whether player wishes to continue and returns a boolean
function confirmContinuePlay() {
  let choice = readline.question(plainMessages.confirmContinuePlay)
    .toLowerCase();
  return (choice === 'y' || choice === 'yes');
}

/* FUNCTIONS FOR DISPLAYING OUTPUT TO CONSOLE */

// draws current board arrangement based on values of GRID_SQUARES properties
function displayBoard() {
  console.clear();
  console.log('');
  console.log('     |     |');
  console.log(`  ${GRID_SQUARES[1]}  |  ${GRID_SQUARES[2]}  |   ${GRID_SQUARES[3]}`);
  console.log('     |     |');
  console.log('-----+-----+-----');
  console.log('     |     |');
  console.log(`  ${GRID_SQUARES[4]}  |  ${GRID_SQUARES[5]}  |   ${GRID_SQUARES[6]}`);
  console.log('     |     |');
  console.log('-----+-----+-----');
  console.log('     |     |');
  console.log(`  ${GRID_SQUARES[7]}  |  ${GRID_SQUARES[8]}  |   ${GRID_SQUARES[9]}`);
  console.log('     |     |');
  console.log('');
}

// converts messages to display in larger font
function displayLarge(text) {
  let message = "\n" + asciiTextGenerator(text, "2") + "\n";
  console.log(message);
}

// we want to display a message in large font at the end of the game but not
// if it's one in a best of five matchup, so we'll make two functions
// to display results
function displaySingleGameResult(winner) {
  if (winner === 'player') {
    displayLarge(bigMessages.victory);
  }
  if (winner === 'computer') {
    displayLarge(bigMessages.defeat);
  }
  if (winner === 'tie') {
    displayLarge(bigMessages.tie);
  }
}

// displays winner of best of five game
function displayBestOfFiveResult(winner) {
  if (winner === 'player') {
    displayLarge(bigMessages.victory);
  } else {
    displayLarge(bigMessages.defeat);
  }
}

// for individual matches in a best of five game we'll display the winner
// of each match in normal text
function displayWinner(winner) {
  if (winner === 'player') {
    console.log('Player won.\n');
  }
  if (winner === 'computer') {
    console.log('Computer won.\n');
  }
  if (winner === 'tie') {
    console.log('Tie.\n');
  }
}

// display current tally after each match in a best of 5 game
function displayCurrentTally(playerWins, computerWins) {
  console.log(`Current tally is player: ${playerWins}, computer: ${computerWins}.\n`);
}


/* FUNCTIONS FOR PLAYING A FULL GAME OF EITHER TYPE */

// returns winner of a single game
function playSingleGame() {
  resetBoard();
  GAME_STATE.movesMade = 0;

  while (true) {
    displayBoard();
    playerMove();

    if (getWinner()) {
      return 'player';
    }
    if (GAME_STATE.movesMade === 9) {
      return 'tie';
    }
    computerMove();
    if (getWinner()) {
      return 'computer';
    }
  }
}

// determines winner in a best of 5 contest (option to quit offered once more
// than three consecutive ties have occurred)
/* eslint-disable max-lines-per-function */
/* eslint-disable max-statements */
function playBestOfFive() {

  while (true) {

    let winner = playSingleGame();
    displayBoard();
    displayWinner(winner);
    updateGameState(winner);
    if (GAME_STATE.consecutiveTies >= 3 && !confirmContinuePlay()) {
      break;
    }
    displayCurrentTally(GAME_STATE.playerWins, GAME_STATE.computerWins);
    if (GAME_STATE.playerWins + GAME_STATE.computerWins === 5) {
      return (GAME_STATE.playerWins > GAME_STATE.computerWins) ? 'player' : 'computer';
    }
    let choice = readline.question("Press enter to continue.");
    if (choice !== null) {
      continue;
    }
  }
  return 'neither';
}
/* eslint-enable max-lines-per-function */

// at conclusion of game allow user to play again or quit
function playAgainOrQuit() {
  let option = playAgain();
  if (option === 'y') {
    playTicTacToe();
  } else {
    console.clear();
    displayLarge(bigMessages.goodbye);
  }
}

/* FUNCTION TO WRAP UP EVERYTHING IN ONE PACKAGE */

function playTicTacToe() {
  setUpNewGame();
  let winner;

  if (GAME_OPTIONS.gameType === 'single') {
    winner = playSingleGame();
    displayBoard();
    displaySingleGameResult(winner);
  } else {
    winner = playBestOfFive();
    if (winner === 'neither') {
      console.clear();
      displayLarge(bigMessages.goodbye);
    } else {
      displayBestOfFiveResult(winner);
    }
  }
  playAgainOrQuit();
}

playTicTacToe();