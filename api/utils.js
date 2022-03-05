function requireUser(request, response, next) {
    if (!request.user) {
        next ({
            name: "MissingUserError",
            message: "You must be logged in to perform this action"
        });
    }

    next();
}

module.exports = {requireUser}