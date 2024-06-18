const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username or password missing..." });
  }
  if (isValid(username)) {
    return res.status(400).json({ message: "User already exists" });
  }
  // Add the new user
  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        return res.status(200).json(book);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author.toLowerCase();
    const matchingBooks = Object.values(books).filter(book => book.author.toLowerCase() === author);

    if (matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks);
    } else {
        return res.status(404).json({ message: "Books not found!" });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title.toLowerCase();
    const matchingBooks = Object.values(books).filter(book => book.title.toLowerCase().includes(title));

    if (matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks);
    } else {
        return res.status(404).json({ message: "No books found with the given title" });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});


// Function to fetch the list of books available in the shop
const fetchAllBooks = async () => {
    try {
      const response = await axios.get('/');
      return response.data;
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error; // Optional: Throw the error to handle it elsewhere
    }
  };



// Function to fetch a book by ISBN
const getBookByIsbn = async (isbn) => {
    try {
      const response = await axios.get(`/isbn/${isbn}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching book:', error);
      throw error; // Optional: Throw the error to handle it elsewhere
    }
  };


// Function to fetch books by author
const getBooksByAuthor = async (author) => {
    try {
      const response = await axios.get(`/author/${author}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching books by author:', error);
      throw error; // Optional: Throw the error to handle it elsewhere
    }
  };


// Function to fetch books by title
const getBooksByTitle = async (title) => {
    try {
      const response = await axios.get(`/title/${title}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching books by title:', error);
      throw error; // Optional: Throw the error to handle it elsewhere
    }
  };

module.exports.general = public_users;