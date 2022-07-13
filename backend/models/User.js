const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    hash: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    friends: [
      {
        //https://mongoosejs.com/docs/schematypes.html#objectids
        //Need to ask
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
      },
    ],
  },
  //https://mongoosejs.com/docs/timestamps.html
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
