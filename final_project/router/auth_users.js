const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
  let userswithsamename = users.filter((user) => {
      return user.username === username;
  });
  if (userswithsamename.length > 0) {
      return true;
  } else {
      return false;
  }
};

const authenticatedUser = (username,password)=>{ 
  let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
  });

  if (validusers.length > 0) {
      return true;
  } else {
      return false;
  }
};

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({ message: "Error logging in" });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {

      let accessToken = jwt.sign({
          data: password
      }, 'access', { expiresIn: "30m" });

      req.session.authorization = {
          accessToken, username
      }
      console.log(req.session.authorization)
      return res.status(200).send("User successfully logged in");
  } else {
      return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization['username'];

  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  books[isbn].reviews[username] = review
  console.log(books)
  return res.status(200).json({ message: "Review added/updated" });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization['username'];
  const review = books[isbn].reviews[username];

  if(review) {
    delete review;
    return res.status(200).json({message: "Review successfully deleted!"})
  } else {
    return res.status(404).json({ message: "No review found to delete" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
