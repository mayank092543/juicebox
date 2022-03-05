const express = require("express");
const { getAllTags, getPostsByTagName } = require("../db");
const tagsRouter = express.Router();

tagsRouter.get("/", async (request, response) => {
    try {
        const tags = await getAllTags();

        response.send({
            tags
        });
    } catch ({ name, message }) {
        next({ name, message })
    }
});

tagsRouter.get("/:tagName/posts", async(request, response, next) => {
    const { tagName } = request.params;

    try {
        const allPost = await getPostsByTagName(tagName);

        const posts = allPost.filter(post => {
            if(post.active) {
                return true;
            }

            // the post is not active, but it belogs to the current user
            if(request.user && post.author.id === request.user.id) {
                return true;
            }

            return false;
        })
        response.send({ posts })
    } catch ({ name, message}) {
        next ({ name, message });
    }
});

module.exports = tagsRouter;