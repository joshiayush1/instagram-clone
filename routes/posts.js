var mongoose = require("mongoose");

var postsSchema = new mongoose.Schema({
  caption: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  image: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("Post", postsSchema);
