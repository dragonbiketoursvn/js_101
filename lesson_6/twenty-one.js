/* || CONSTANTS SECTION || */

const asciiTextGenerator = require('ascii-text-generator');

const readline = require("readline-sync");

const GAME_OPTIONS = {
  gameType: null,
  bustLimit: 21,
  dealerLimit: 17
};

const bigMessages = {
  welcome: "twenty one",
  victory: "awesome you won",
  defeat: "darn you lost",
  tie: "it was a tie",
  goodbye: "thanks for playing"
};

const plainMessages = {
  chooseGameType: "Welcome player! Choose one of the following options:\n1) Single game\n2) Best of five\n",
  modifyLimit: "Please enter 'y/yes' or 'n/no' to indicate whether you wish to set a limit other than 21.\n",
  setLimit: "Please enter a positive integer for the new limit.\n",
  setDealerLimit: "Please enter a new dealer limit that's less than the bust limit (otherwise it's not fair).\n",
  hitOrStay: "Do you want another card? ('y/yes' or 'n/no')\n",
  invalid: "I'm afraid that's not a valid choice. Please select one of the options listed above.\n"
};

// use when we need to display card suits and values as output
const SUITS = {
  0: 'clubs',
  1: 'hearts',
  2: 'diamonds',
  3: 'spades'
};

const CARDS = {
  0: 'two',
  1: 'three',
  2: 'four',
  3: 'five',
  4: 'six',
  5: 'seven',
  6: 'eight',
  7: 'nine',
  8: 'ten',
  9: 'jack',
  10: 'queen',
  11: 'king',
  12: 'ace'
};


/* || FUNCTIONS SECTION || */

/* GENERAL UTILITY FUNCTIONS */

// returns a random integer in the range 0 to max (both inclusive)
function getRandomInt(max) {
  let randomInt = Math.floor(Math.random() * (max + 1));
  return randomInt;
}


/* FUNCTIONS FOR CONFIGURING GAME */

function resetGameOptions() {
  GAME_OPTIONS.gameType = null;
  GAME_OPTIONS.bustLimit = 21;
}

function setGameType() {
  let type = getPlayerChoiceOfGameType();
  if (type === '1') {
    GAME_OPTIONS.gameType = 'single';
  } else {
    GAME_OPTIONS.gameType = 'bestOfFive';
  }
}

function setBustLimit() {
  let limit = getPlayerNewLimitValue();
  GAME_OPTIONS.bustLimit = limit;
}

function setDealerLimit() {
  let limit = getDealerNewLimitValue();
  GAME_OPTIONS.dealerLimit = limit;
}


/* FUNCTIONS FOR DISPLAYING OUTPUT TO CONSOLE */

// converts messages to display in larger font
function displayLarge(text) {
  let message = "\n" + asciiTextGenerator(text, "2") + "\n";
  console.log(message);
}

function showCardsAndTotal(hand, playerOrDealer) {
  let total = calculateHandValue(hand);
  let intro = playerOrDealer === 'player' ? "You have the following cards: " : "Dealer has the following cards: ";
  let ending = playerOrDealer === 'player' ? "Your" : "Dealer's";
  console.log(intro);
  hand.forEach(card => {
    console.log(`The ${CARDS[card.value]} of ${SUITS[card.suit]}.`);
  });
  console.log(`${ending} total is ${total}.\n`);
}

function showDealerCard(hand) {
  console.log(`Dealer is showing ${CARDS[hand[1].value]} of ${SUITS[hand[1].suit]}`);
}

// we want to display a message in large font at the end of the game but not
// if it's one in a best of five matchup, so we'll make two functions
// to display results
function displaySingleGameResult(winner) {
  if (winner === 'player') {
    displayLarge(bigMessages.victory);
  }
  if (winner === 'dealer') {
    displayLarge(bigMessages.defeat);
  }
  if (winner === 'tie') {
    displayLarge(bigMessages.tie);
  }
}

// display of winner will vary depending on type of game
// and whether player or dealer busted on their respective turns
function declareWinner([winner, busted, player, dealer]) {
  if (busted) {
    displayWinnerByBust(winner);
  } else {
    displayCardsAndWinner(winner, player, dealer);
  }
}

function displayWinnerByBust(winner) {
  let start = winner === 'player' ? 'Dealer' : 'Player';
  console.log(`${start} busted.`);
  if (GAME_OPTIONS.gameType === 'single') {
    displaySingleGameResult(winner);
  } else {
    displayWinner(winner);
  }
}

function displayCardsAndWinner(winner, player, dealer) {
  showCardsAndTotal(player, 'player');
  showCardsAndTotal(dealer, 'dealer');
  displaySingleGameResult(winner);
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
  if (winner === 'dealer') {
    console.log('Dealer won.\n');
  }
  if (winner === 'tie') {
    console.log('Tie.\n');
  }
}

// display current tally after each match in a best of 5 game
function displayCurrentTally(playerWins, dealerWins) {
  console.log(`Current tally is player: ${playerWins}, dealer: ${dealerWins}.\n`);
}


/* FUNCTIONS FOR GETTING USER INPUT */

function getPlayerChoiceOfGameType() {
  let choice = readline.question(plainMessages.chooseGameType);

  while (!['1', '2'].includes(choice)) {
    choice = readline.question(plainMessages.invalid);
  }

  return choice;
}

function getPlayerModifyLimitOrNot() {
  let choice = readline.question(plainMessages.modifyLimit);

  while (!['y', 'yes', 'n', 'no'].includes(choice.toLowerCase())) {
    choice = readline.question(plainMessages.invalid);
  }

  return choice === 'y' || choice === 'yes';
}

function getPlayerNewLimitValue() {
  let newLimit = parseInt(readline.question(plainMessages.setLimit), 10);

  while (Number.isNaN(newLimit) || newLimit < 1) {
    newLimit = parseInt(readline.question(plainMessages
      .setLimit
      .toUpperCase()
    ), 10);
  }

  return newLimit;
}

function getDealerNewLimitValue() {
  let newLimit = parseInt(readline.question(plainMessages.setDealerLimit), 10);

  while (Number.isNaN(newLimit) || newLimit < 1) {
    newLimit = parseInt(readline.question(plainMessages
      .setLimit
      .toUpperCase()
    ), 10);
  }

  return newLimit;
}

function getPlayerHitOrStay() {
  let hitOrStay = readline.question(plainMessages.hitOrStay);

  while (!['y', 'yes', 'n', 'no'].includes(hitOrStay.toLowerCase())) {
    hitOrStay = readline.question(plainMessages.invalid);
  }

  return hitOrStay === 'y' || hitOrStay === 'yes';
}

function getPlayAgainChoice() {
  let choice = readline.question("Would you like to play again (y/n)? ");

  if (choice.toLowerCase() === 'y' || choice.toLowerCase() === 'yes') {
    return 'y';
  } else {
    return 'n';
  }
}


/* FUNCTIONS FOR SETTING UP DECK, DEALING CARDS AND DETERMINING HAND VALUES */

function createDeck() {
  let deck = [...Array(52)];
  for (let x in deck) {
    deck[x] = {suit: null, value: null};
  }

  for (let idx = 0; idx < 4; idx += 1) {
    for (let idxInner = 0; idxInner < 13; idxInner += 1) {
      let currentDeckIndex = (13 * idx) + idxInner;
      deck[currentDeckIndex].suit = idx;
      deck[currentDeckIndex].value = idxInner;

      if (idxInner < 9) {
        deck[currentDeckIndex].points = idxInner + 2;
      } else if ((idxInner < 12)) {
        deck[currentDeckIndex].points = 10;
      }
    }
  }

  return deck;
}

function dealRandomCard(deck, player) {
  let index = getRandomInt(deck.length - 1);
  let randomCard = deck.splice(index, 1)[0];
  player.push(randomCard);
}

function dealInitialCards(deck, player, dealer) {
  dealRandomCard(deck, player);
  dealRandomCard(deck, dealer);
  dealRandomCard(deck, player);
  dealRandomCard(deck, dealer);
}

function calculateHandValue(hand) {
  let nonAceTotal = calculateNonAceValue(hand);
  let aceCount = hand.filter(card => card.value === 12).length;
  let aceTotal = calculateAceValue(nonAceTotal, aceCount);

  return nonAceTotal + aceTotal;
}

function calculateNonAceValue(hand) {
  let nonAces = hand.filter(card => card.hasOwnProperty('points'));
  return nonAces.reduce((total, next) => total + next.points, 0);
}

function calculateAceValue(nonAceTotal, aceCount) {

  let remainingMargin = GAME_OPTIONS.bustLimit - nonAceTotal;
  let aceValue = aceCount * 11;

  while (aceValue > remainingMargin) {
    if (aceValue - 10 < 0) {
      break;
    } else {
      aceValue -= 10;
    }
  }

  return aceValue;
}

function playerTurn(deck, player, playerScore) {
  playerScore = calculateHandValue(player);

  while (getPlayerHitOrStay()) {
    dealRandomCard(deck, player);
    playerScore = calculateHandValue(player);
    showCardsAndTotal(player, 'player');

    if (playerScore > GAME_OPTIONS.bustLimit) {
      playerScore = -1;
      break;
    }
  }

  return [deck, player, playerScore];
}

function dealerTurn(deck, dealer, dealerScore) {
  dealerScore = calculateHandValue(dealer);

  while (dealerScore < GAME_OPTIONS.dealerLimit) {
    dealRandomCard(deck, dealer);
    dealerScore = calculateHandValue(dealer);

    if (dealerScore > GAME_OPTIONS.bustLimit) {
      dealerScore = -1;
      break;
    }
  }

  return [deck, dealer, dealerScore];
}

function incrementWinCounter(winCounter, winner) {
  if (winner === 'player') {
    winCounter.playerWins += 1;
  }
  if (winner === 'dealer') {
    winCounter.dealerWins += 1;
  }
}

function determineWinner(playerScore, dealerScore) {
  switch (true) {
    case playerScore > dealerScore:
      return 'player';
    case playerScore < dealerScore:
      return 'dealer';
    default:
      return 'tie';
  }
}


/* FUNCTIONS FOR PLAYING A FULL GAME OF EITHER TYPE */

// consolidates all the steps for setting up a new game
function setUpNewGame() {
  console.clear();
  displayLarge(bigMessages.welcome);
  resetGameOptions();
  setGameType();
  if (getPlayerModifyLimitOrNot()) {
    setBustLimit();
    setDealerLimit();
  }
}


// returns winner of a single game
/* eslint-disable max-statements */
function playSingleGame() {
  let deck = createDeck();
  let player = [];
  let dealer = [];
  let playerScore, dealerScore;
  console.clear();
  dealInitialCards(deck, player, dealer);
  showCardsAndTotal(player, 'player');
  showDealerCard(dealer);
  [deck, player, playerScore] = playerTurn(deck, player, playerScore);
  if (playerScore === -1) {
    return ['dealer', true];
  }
  [deck, dealer, dealerScore] = dealerTurn(deck, dealer, dealerScore);
  if (dealerScore === -1) {
    return ['player', true];
  }
  let winner = determineWinner(playerScore, dealerScore);
  return [winner, false, player, dealer];
}
/* eslint-enable max-statements */

// determines winner in a best of 5 contest (ties ignored)
/* eslint-disable max-lines-per-function */
/* eslint-disable max-statements */
function playBestOfFive() {

  let winCounter = { playerWins: 0, dealerWins: 0 };

  while (winCounter.playerWins + winCounter.dealerWins < 5) {
    let [winner, busted, player, dealer] = playSingleGame();
    console.clear();
    if (busted) {
      displayWinnerByBust(winner);
    } else {
      console.clear();
      showCardsAndTotal(player, 'player');
      showCardsAndTotal(dealer, 'dealer');
      displayWinner(winner);
    }

    incrementWinCounter(winCounter, winner);
    displayCurrentTally(winCounter.playerWins, winCounter.dealerWins);
    if (winCounter.playerWins + winCounter.dealerWins < 5 && (readline.question("Press enter to continue.") !== null)) {
      continue;
    }
  }

  return (winCounter.playerWins > winCounter.dealerWins) ? 'player' : 'dealer';
}
/* eslint-enable max-lines-per-function */
/* eslint-enable max-statements */

/* TOP-LEVEL FUNCTION */

function playTwentyOne() {
  setUpNewGame();

  if (GAME_OPTIONS.gameType === 'single') {
    let winner, busted, player, dealer;
    [winner, busted, player, dealer] = playSingleGame();
    console.clear();
    declareWinner([winner, busted, player, dealer]);
  } else {
    let winner = playBestOfFive();
    displayBestOfFiveResult(winner);
  }

  let option = getPlayAgainChoice();
  if (option === 'y') {
    playTwentyOne();
  } else {
    console.clear();
    displayLarge(bigMessages.goodbye);
  }
}

/* THE MAIN PROGRAM */
playTwentyOne();