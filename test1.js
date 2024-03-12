console.log("====================================");
console.log("called");
console.log("====================================");
const { jwtDecode } = require("jwt-decode"); // Importing jwtDecode from jwt-decode

// Replace token with your actual JWT token string
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZTM1ZjlkZjA1N2NkNmI5Y2VjNzRkMCIsInVzZXJuYW1lIjoidml2ZWsiLCJpYXQiOjE3MDk2MjYyNDQsImV4cCI6MTcwOTYyOTg0NH0.OAiZCIXimJ-yuL7Tie877RKxo51iHlpjQf3ZVZzzWCQ";

// Decode the token
const decodedToken = jwtDecode(token); // Using jwtDecode

console.log(decodedToken);
// Extract the username
const username = decodedToken.username;

console.log(username); // This will log the username extracted from the token
