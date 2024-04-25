const mongoose = require("mongoose");

var storySchema = new mongoose.Schema({
    image: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
}) 

module.exports = mongoose.model("Story", storySchema);