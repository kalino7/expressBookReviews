const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let foundUser = users.filter((user)=>user.username==username);
    if(foundUser.length > 0)
    {
        // username exist
        return true;
    }

    return false;
}

const authenticatedUser = (username,password)=>{ //returns boolean
 let foundUser = users.filter((user)=>user.username==username && user.password==password);
    if(foundUser.length > 0)
    {
        // username exist
        return true;
    }
    return false;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  
    let username = req.body.username;
    let password = req.body.password;

    try {
        
        if(!authenticatedUser(username, password))
        {
            throw new Error(`The username: ${username} or Password is Invalid`);
        }

        const accessToken = jwt.sign({data: password}, "access", {expiresIn: 60*60});
        req.session.authorization = {accessToken, username};

        if(!req.session.authorization)
        {
            throw new Error(`Something went wrong in generating token`);
        }
        res.status(200).send(`${username} has been logged in!`);

    } catch (err) {
        res.status(404).send(err.message);
    }

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  
    const isbn = parseInt(req.params.isbn);
    try {
        if(!books[isbn])
        {
            throw new Error(`The ISBN Number: ${isbn} does not exist`);
        }
    let reviews = books[isbn]["reviews"];
    let review = req.query.review;
    const username = req.session.authorization["username"];
    let found = false;

    for (const key in reviews) {
        if(reviews[key]["username"] == username)
        {
            reviews[key]["review"] = review;
            found = true;
        }
    }

    if(!found)
    {
        // not found hence a new user
        let count = Object.keys(reviews).length;
        reviews[count] = {username, review};
    }

    books[isbn]["reviews"] = reviews;

    res.status(200).send("Review updated!");

    } catch (error) {
        res.status(404).send(`${error.message}`);
    }

});

regd_users.delete("/auth/review/:isbn", (req,res)=>{
    const isbn = req.params.isbn;
    const user = req.session.authorization["username"];
    let found = false;

    try {
        if(!books[isbn])
        {
            res.status(404);
            throw new Error(`The ISBN Number: ${isbn} does not exist`);
        }

        let reviews = books[isbn]["reviews"];
        for (const key in reviews) {
            if(reviews[key]["username"] == user)
            {
                delete reviews[key];
                found = true;
            }
        }

        if(!found)
        {
            res.status(403);
            throw new Error(`${user} does not have the privilege to delete this post`)
        }

        res.status(200).send("Review Deleted!");

    } catch (err) {
        res.send(err.message);
    }
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
