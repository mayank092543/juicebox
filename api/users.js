const express = require("express");
const usersRouter = express.Router();
require('dotenv').config();
const jwt = require("jsonwebtoken");
const {JWT_SECRET} = process.env;
const { getAllUsers, getUserByUsername, createUser } = require("../db");

usersRouter.use((request, response, next) => {
    console.log("A request is being made to /users");

    next();
});

usersRouter.get("/", async(request, response) => {
    const users = await getAllUsers();

    response.send({
            users
        });
    });

usersRouter.post("/login", async (request, response, next) => {
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

        if( user && user.password == password) {

            // create token and return to user
            const token = jwt.sign({ id: user.id, username }, JWT_SECRET);

            response.send({ message: "You're logged in!", token: token});
        } else {
            next({
                name: "IncorrectCredentialsError",
                message: "Username or password is incorrect"
            });
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
});

usersRouter.post("/register", async (request, response, next) => {
    const { username, password, name, location } = request.body;

    try {
        const _user = await getUserByUsername(username);

        if(_user) {
            next({
                name: "UserExistsError",
                message: "A user by that username already exists"
            });
        }

        const user = await createUser({
            username,
            password,
            name,
            location
        });

        const token = jwt.sign({id: user.id, username}, JWT_SECRET, {expiresIn: "1W"});
        response.send({
            message: "thank you for signing up", token
        });
    } catch ({ name, message }) {
        next({ name, message })
    }
});

module.exports = usersRouter;