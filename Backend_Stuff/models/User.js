const mongoose = require("mongoose");

////////////////////////////////
// UserSchema
////////////////////////////////

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    hash: {
      type: String,
      required: true,
      minLength: 12,
    },
    name: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
      required: true,
    },
    createdAt: {
      type: Date,
      immutable: true,
      default: () => Date.now(),
    },
    updatedAt: {
      type: Date,
      default: () => Date.now(),
    },
    friends: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
      },
    ],
  },
  { collections: "users" }
);

module.exports = mongoose.model("User", UserSchema);
