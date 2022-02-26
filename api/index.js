const express = require("express");
const apiRouter = express.Router();

require('dotenv').config();
const jwt = require("jsonwebtoken");
const { getUserById } = require("../db");
const { JWT_SECRET } = process.env;


// fetch('our api url', {
//     method: 'SOME_METHOD',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': 'Bearer HOLYMOLEYTHISTOKENISHUGE'
//     },
//     body: JSON.stringify({})
//   })

// set `req.user` if possible
apiRouter.use(async (req, res, next) => {
  const prefix = 'Bearer ';
  const auth = req.header('Authorization');

  console.log(JWT_SECRET);

  if (!auth) { // nothing to see here
    console.log(req.header)
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);

    try {
      const { id } = jwt.verify(token, JWT_SECRET);

      if (id) {
        req.user = await getUserById(id);
        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: 'AuthorizationHeaderError',
      message: `Authorization token must start with ${ prefix }`
    });
  }
});

apiRouter.use((request, response, next) => {
    if (request.user) {
        console.log("User is set: ", request.user);
    }

    next();
});

const usersRouter = require("./users");
apiRouter.use("/users", usersRouter);

const postsRouter = require("./posts");
apiRouter.use("/posts", postsRouter);

const tagsRouter = require("./tags");
apiRouter.use("/tags", tagsRouter);


module.exports = apiRouter;