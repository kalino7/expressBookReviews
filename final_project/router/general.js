const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
 
    let username = req.body.username;
    let password = req.body.password;

    try {

        if(isValid(username))
        {
           throw new Error(`${username} already exist`);
        }

        if(!username)
        {
            throw new Error(`username field is empty `);
        }

        if(!password)
        {
            throw new Error(`password field is empty `);
        }

        users.push({username, password});
        res.status(200).send(`${username} has been added`);
        
    } catch (err) {
        res.status(403).send(err.message);
    }

});

// Get the book list available in the shop
public_users.get('/',function (req, res) {

    try {
        if(!books)
        {
            throw new Error(`Not available at the moment`);
        }

    res.status(200).send(JSON.stringify(books, null, 4));

    } catch (err) {
        res.status(404).send(err.message);
    }

});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  
    const isbn = parseInt(req.params.isbn);
    try {
        if(!books[isbn])
        {
            throw new Error(`The ISBN Number: ${isbn} does not exist`);
        }

        res.status(200).send(JSON.stringify(books[isbn], null, 4));
    } catch (error) {
        res.status(404).send(`${error.message}`);
    }

 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  let book = null;
  for (const key in books) {
    if(books[key]["author"] == author)
    {
        book = books[key];
    }
  }

  try {
    if(book === null)
    {
        throw new Error(`The author: ${author}  does not exist`);
    }
    res.status(200).send(JSON.stringify(book, null, 4));
  } catch (err) {
    res.status(404).send(`${err.message}`);
  }

});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  let book = null;
  for (const key in books) {
    if(books[key]["title"] == title)
    {
        book = books[key];
    }
  }

  try {
    if(book === null)
    {
        throw new Error(`The book title: ${title}  does not exist`);
    }
    res.status(200).send(JSON.stringify(book, null, 4));
  } catch (err) {
    res.status(404).send(`${err.message}`);
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
 const isbn = parseInt(req.params.isbn);
    try {
        if(!books[isbn])
        {
            throw new Error(`The ISBN Number: ${isbn} does not exist`);
        }

        res.status(200).send(JSON.stringify(books[isbn]["reviews"], null, 4));
    } catch (error) {
        res.status(404).send(`${error.message}`);
    }
});

module.exports.general = public_users;
