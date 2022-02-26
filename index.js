const PORT = 3000;
const express = require("express");
const server = express();

const morgan = require("morgan");
server.use(morgan("dev"));

server.use(express.json()) // this function will read incoming JSON from requests

const apiRouter = require("./api");
server.use("/api", apiRouter);

const { client } = require("./db");
client.connect();

server.listen (PORT, () => {
    console.log("The server is up on port", PORT)
});

server.use((error, request, response, next) => {
    response.send({
        name: error.name,
        message: error.message
    });
});