const express = require("express");
const postsRouter = express.Router();
const { getAllUsers, createPost, getPostById, updatePost, getAllPosts } = require("../db");
const { requireUser } = require("./utils");


postsRouter.get("/", async(request, response, next) => {
    try {
        const allPosts = await getAllPosts();

        const posts = allPosts.filter(post => {
        // keep a post if it is either active, or if it belongs to the current user
            if(post.active) {
                return true;
            }

            if(post && post.author.id === request.user.id) {
                return true;
            }
            
            return false;
        });

        response.send({posts});
    } catch ({ name, message }) {
        next ({ name, message });
    }
});


postsRouter.post("/", requireUser, async (request, response, next) => {
    const { title, content, tags = "" } = request.body;

    const tagArr = tags.trim().split(/\s+/);
    const postData = {};

    // only send the tags if there are some to send

    if (tagArr.length) {
        postData.tags = tagArr;
    }

    try {
        postData.authorId = request.user.id;
        postData.title = title;
        postData.content = content;

        const post = await createPost(postData);

        if(post) {
            response.send({
                post
            })
        } else {
            next({
                name: "PostCreationError",
                message: "There was an error creating your post. Please try again."
            })
        }
    }catch ({ name, message }) {
        next({ name, message });
    }
});

postsRouter.patch("/:postID", requireUser, async(request, response, next) => {
    const { postId } = request.params;
    const { title, content, tags } = request.body;

    const updateFields = {};

    if (tags && tags.length > 0) {
        updateFields.tags = tags.trim().split(/\s+/);
    }

    if (title) {
        updateFields.title = title;
    }

    if (content) {
        updateFields.content = content;
    }

    try {
        const orginialPost = await getPostById(postId);

        if (orginialPost.author.id === request.user.id) {
            const updatedPost = await updatePost(postId, updateFields);
            response.send({ post: updatedPost })
        } else {
            next({
                name: "UnauthorizedUserError",
                message: "You cannot update a post that is not yours"
            })
        }
    } catch ({ name, message }) {
        next ({ name, message })
    }

});

postsRouter.delete("/:postId", requireUser, async(request, response, next) => {
    try {
        const post = await getPostById(request.params.postId);

        if(post && post.author.id === request.user.id) {
            const updatedPost = await updatePost(post.id, { active: false });

            response.send({ post: updatedPost });
        } else {
            // if there was a post, throw UnauthorizedUserError, otherwise throw PostNotFoundError

            next(post ? {
                name: "UnauthorizedUserError",
                message: "You cannot delete a post which is not yours"
            } : {
                name: "PostNotFoundError",
                message: "That post does not exist"
            });
        }

    } catch ({ name, message }) {
        next({ name, message })
    }
});



module.exports = postsRouter;