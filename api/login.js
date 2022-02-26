const express = require("express");
const loginRouter = express.Router();
const jwt = require("jsonwebtoken");
const {JWT_SECRET} = process.env;
const { getUserByUsername } = require("../db");

loginRouter.post("/login", async (request, response, next) => {
    const { username, password } = request.body;  // const username = request.body.username      // const password = request.body.password

    // request must have both
    if( !username || !password ) {
        next({
            name: "MissingCredentialsError",
            message: "Please supply both a username and password"
        });
    }

    try {
        const user = await getUserByUsername(username);

        if (user && user.password == password) {
            const token = jwt.sign({ user }, JWT_SECRET);
            // create token & return to user
            res.send({ message: "you're logged in!", token: token });
        } else {
            next({
                name: 'IncorrectCredentialsError',
                message: 'Username or password is incorrect'
            });
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
});

module.exports = loginRouter;