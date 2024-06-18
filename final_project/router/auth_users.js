const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const SECRET_KEY = "your_secret_key";

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
return users.some((user) => user.username === username);
};

const authenticatedUser = (req, res, next)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to authenticate token' });
    }
    req.user = decoded;
    next();
  });
};

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username or password missing' });
  }

  if (!isValid(username)) {
    return res.status(401).json({ message: 'Invalid username' });
  }

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
  return res.status(200).json({ token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", authenticatedUser, (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.query; // Assuming review text is provided as a query parameter
    const username = req.user.username; // Extract username from decoded JWT payload
  
    if (!isbn || !review) {
      return res.status(400).json({ message: 'ISBN and review are required' });
    }
  
    // Check if the book exists in the database
    if (!books[isbn]) {
      return res.status(404).json({ message: 'Book not found' });
    }
  
    // Initialize reviews array if it doesn't exist or not an array
    if (!Array.isArray(books[isbn].reviews)) {
      books[isbn].reviews = [];
    }
  
    // Find existing review by the current user
    const existingReviewIndex = books[isbn].reviews.findIndex(r => r.username === username);
  
    if (existingReviewIndex >= 0) {
      // Modify existing review
      books[isbn].reviews[existingReviewIndex].review = review;
      res.json({ message: 'Review updated', reviews: books[isbn].reviews });
    } else {
      // Add new review
      books[isbn].reviews.push({ username, review });
      res.json({ message: 'Review added', reviews: books[isbn].reviews });
    }
  });


// Delete a book review
regd_users.delete("/auth/review/:isbn", authenticatedUser, (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username; // Extract username from decoded JWT payload
  
    if (!isbn) {
      return res.status(400).json({ message: 'ISBN is required' });
    }
  
    // Check if the book exists in the database
    if (!books[isbn]) {
      return res.status(404).json({ message: 'Book not found' });
    }
  
    // Initialize reviews array if it doesn't exist or not an array
    if (!Array.isArray(books[isbn].reviews)) {
      books[isbn].reviews = [];
    }
  
    // Find index of the review by the current user
    const reviewIndex = books[isbn].reviews.findIndex(r => r.username === username);
  
    if (reviewIndex >= 0) {
      // Remove the review
      books[isbn].reviews.splice(reviewIndex, 1);
      res.json({ message: 'Review deleted', reviews: books[isbn].reviews });
    } else {
      res.status(404).json({ message: 'Review not found for the given user' });
    }
  });
  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
