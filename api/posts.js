const express = require("express");
const postsRouter = express.Router();
const { getAllUsers } = require("../db");

postsRouter.use((request, response, next) => {
    console.log("A request is being made to /posts");

    next();
});

postsRouter.get("/", async(request, response) => {
    const posts = await getAllUsers();

    response.send({
        posts
       // "posts": []
    })
})

module.exports = postsRouter;