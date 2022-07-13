const mongoose = require("mongoose");

const BoardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      immutable: true,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
    members: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
      },
    ],
    status: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Board", BoardSchema);
