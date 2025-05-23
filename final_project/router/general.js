const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Register user
public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {

    if (!isValid(username)) {
        users.push({"username": username, "password": password});
        return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
        return res.status(404).json({message: "User already exists!"});
    }
  }

  return res.status(404).json({message: "Unable to register user."});
});

// Get all books with axios
async function fetchBooks() {
  try {
    const response = await axios.get('http://localhost:5000/');
    console.log('Books: ', response);
    return response;
  } catch (error) {
    console.error('Error fetching books');
    throw error;
  }
};

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.send(JSON.stringify(books, null , 4));
});

// Get book based on isbn with axios
async function fetchBookWithISBN(isbn) {
  try {
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    console.log('Book: ', response);
    return response;
  } catch {
    console.error('Error fetching book with ISBN');
    throw error;
  }
};

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn]);
});

// Get books by the name of the author with axios
async function fetchBookByAuthor(author) {
  try {
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    console.log(author, response);
    return response;
  } catch {
    console.error('Error fetching book by author');
    throw error;
  }
}

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author
  
  const result = Object.entries(books)
    .filter(([id, book]) => book.author === author)
    .map(([id, book]) => ({ isbn: parseInt(id), ...book }));

  res.send(JSON.stringify(result, null, 4));
});

// Getting books by title with axios
async function fetchBookByTitle(title) {
  try {
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    console.log(response);
    return response;
  } catch {
    console.error('Error fetching book by title');
    throw error;
  }
}

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title

    const result = Object.entries(books)
        .filter(([id, book]) => book.title === title)
        .map(([id, book]) => ({ isbn: parseInt(id), ...book }));

    res.send(JSON.stringify(result, null, 4));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const review = books[isbn].reviews;
  res.send(JSON.stringify(review, null, 4));
});

module.exports.general = public_users;