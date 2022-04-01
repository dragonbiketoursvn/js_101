/* A simple loan payment calculator */

const readline = require("readline-sync");
let principal, duration, apr;

// input validation to ensure user enters a numeric value >= 0
function isNumeric(input) {
  if (Number.isNaN(Number(input))) {
    return false;
  }
  if (Number(input) < 0) {
    return false;
  }
  return true;
}

// for the principal or loan duration only an integer value is acceptable
function validatePrincipalOrDuration(input) {
  input = Number(input);
  if (Math.trunc(input) !== input || input < 1) {
    return false;
  }
  return true;
}

// prompt user for inputs and if invalid display error message and re-prompt
function getInputs() {
  principal = readline.question("What is the loan amount in USD?\n");

  while (!isNumeric(principal) || !validatePrincipalOrDuration(principal)) {
    principal = readline.question("Please enter a valid loan amount (must be a positive integer).\n");
  }

  duration = readline.question("What is the loan duration in years?\n");

  while (!isNumeric(duration) || !validatePrincipalOrDuration(duration)) {
    duration = readline.question("Please enter a valid duration length (must be a positive integer).\n");
  }

  apr = readline.question("Please enter the APR in percentage form.\n");

  while (!isNumeric(apr)) {
    apr = readline.question("Please enter a non-negative numeric value.\n");
  }
}

function calculatePayment() {
  let mpr = apr / 100 / 12; // calculate monthly interest
  let months = duration * 12; // get loan duration in months
  // handle zero-interest edge case
  if (mpr === 0) {
    return principal / months;
  }
  return principal * (mpr / (1 - Math.pow((1 + mpr), (-months))));
}

function loanCalculator() {
  getInputs();
  let monthlyPayment = calculatePayment().toFixed(2);
  console.log(`The monthly payment is $${monthlyPayment}`);
}

loanCalculator();

// check whether user wishes to make another calculation
let quitOrContinue = true;

while (quitOrContinue) {
  let response = readline.question("Would you like to perform another calculation? (y/n)");
  // just treat any response other than 'y' or 'Y' as no
  if (response.toLowerCase() === 'y') {
    loanCalculator();
  } else {
    quitOrContinue = false;
  }
}