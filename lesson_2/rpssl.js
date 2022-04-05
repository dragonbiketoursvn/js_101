/* GLOBAL VARIABLES SECTION */
// this package lets us spice up the display a little bit
const asciiTextGenerator = require('ascii-text-generator');

// and readline-sync for console input
const readline = require("readline-sync");

// any messages we want to display in a larger font go here
const bigMessages = {
  welcome: "rock paper scissors\\nspock lizard",
  victory: "awesome you won",
  defeat: "darn you lost",
  tie: "it was a tie",
  goodbye: "thanks for playing"
};

// and any we want as normal text go here
const plainMessages = {
  start: "Welcome player! Choose one of the following options:\n1) Single game\n2) Best of five\n",
  choose: "Choose your weapon!\n1)rock\n2)paper\n3)scissors\n4)spock\n5)lizard\n",
  invalid: "I'm afraid that's not a valid choice. Please select one of the options listed above.\n"
};

// store the weapon options as an array
const weapons = ['rock', 'paper', 'scissors', 'Spock', 'lizard'];


/* FUNCTIONS SECTION */
// this converts messages to display in larger font
function displayLarge(text) {
  let message = "\n" + asciiTextGenerator(text, "2") + "\n";
  console.log(message);
}

// validates and returns user input when asked to choose game
function chooseGame() {
  let choice = readline.question(plainMessages.start);
  while (choice !== '1' && choice !== '2') {
    choice = readline.question(plainMessages.invalid);
  }
  return choice;
}

// generates a random int between 1 and 5 (inclusive) and returns it as a string
function getComputerChoice() {
  let int = Math.ceil(5 * Math.random());
  return String(int);
}

// gets and returns player's choice of weapon
function getPlayerChoice() {
  let choice = readline.question(plainMessages.choose);
  while (!(Number(choice) >= 1 && Number(choice) <= 5) || choice.length > 1) {
    choice = readline.question(plainMessages.invalid);
  }
  return choice;
}

// given two choices returns the winner or tie
function getWinner(playerChoice, computerChoice) {
  switch (true) {
    case (playerChoice === '1' && (computerChoice === '3' || computerChoice === '5')):
    case (playerChoice === '2' && (computerChoice === '1' || computerChoice === '4')):
    case (playerChoice === '3' && (computerChoice === '2' || computerChoice === '5')):
    case (playerChoice === '4' && (computerChoice === '1' || computerChoice === '3')):
    case (playerChoice === '5' && (computerChoice === '2' || computerChoice === '4')):
      return 'player';
    case (playerChoice === computerChoice):
      return 'tie';
    default:
      return 'computer';
  }
}

// returns winner of a single match and both player's choices
function playOne() {
  let playerChoice = getPlayerChoice();
  let computerChoice = getComputerChoice();
  let winner = getWinner(playerChoice, computerChoice);
  return [playerChoice, computerChoice, winner];
}

// after a single game or each match in a best of five game, display
// the choices made by each player
function displayWeaponChoices(playerChoice, computerChoice) {
  console.clear();
  console.log(`You chose ${weapons[playerChoice - 1]}. Computer chose ${weapons[computerChoice - 1]}.\n`);
}

// we want to display a message in large font at the end of the game but not
// if it's one in a best of five matchup, so we'll make two display functions
function displaySingleGameResult(playerChoice, computerChoice, winner) {
  displayWeaponChoices(playerChoice, computerChoice);
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

// determines winner in a best of 5 contest (ties ignored)
function playFive() {

  let playerWins = 0;
  let computerWins = 0;

  while (playerWins + computerWins < 5) {
    let [playerChoice, computerChoice, winner] = playOne();
    displayWeaponChoices(playerChoice, computerChoice);
    displayWinner(winner);

    if (winner === 'player') {
      playerWins += 1;
    }
    if (winner === 'computer') {
      computerWins += 1;
    }
    displayCurrentTally(playerWins, computerWins);
  }

  return (playerWins > computerWins) ? 'player' : 'computer';
}

// displays winner of best of five game
function displayBestOfFiveResult(winner) {
  if (winner === 'player') {
    displayLarge(bigMessages.victory);
  } else {
    displayLarge(bigMessages.defeat);
  }
}

// validates and returns user input when asked if they'd like to play again
// any response other than y or yes we'll take as a no
function playAgain() {
  let choice = readline.question("Would you like to play again (y/n)? ");

  if (choice.toLowerCase() === 'y' || choice.toLowerCase() === 'yes') {
    return 'y';
  } else {
    return 'n';
  }
}

// wrap everything up into a single function for convenience
/* eslint-disable max-lines-per-function */
function playRPSSL() {
  console.clear();
  displayLarge(bigMessages.welcome);
  let game = chooseGame();

  if (game === '1') {
    console.clear();
    let [playerChoice, computerChoice, winner] = playOne();
    displaySingleGameResult(playerChoice, computerChoice, winner);
  } else {
    console.clear();
    let winner = playFive();
    displayBestOfFiveResult(winner);
  }

  let option = playAgain();
  if (option === 'y') {
    playRPSSL();
  } else {
    console.clear();
    displayLarge(bigMessages.goodbye);
  }
}
/* eslint-enable max-lines-per-function */

playRPSSL();
