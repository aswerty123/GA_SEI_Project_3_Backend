const mongoose = require("mongoose");

////////////////////////////////
// CardSchema
////////////////////////////////

const CardSchema = new mongoose.Schema({
  actionTitle: {
    type: String,
    required: true,
  },
  actionDesc: {
    type: String,
    required: true,
  },
  comments: [String],
  status: String,
  //=================================== keeping track of creation and updated owner and date
  createdBy: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    immutable: true,
    ref: "User",
  },
  createdAt: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
  updatedBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
  },
  updatedAt: {
    type: Date,
    default: () => Date.now(),
  },
  //===================================
});

////////////////////////////////
// BoardSchema
////////////////////////////////

const BoardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  //=================================== keeping track of creation and updated owner and date

  createdBy: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    immutable: true,
    ref: "User",
  },
  createdAt: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
  updatedBy: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: "User",
  },
  updatedAt: {
    type: Date,
    default: () => Date.now(),
  },
  //=================================== Array of members of the project
  members: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
  ],
  //=================================== Array of Active Cards
  activeCards: [CardSchema],
  //=================================== Array of Archive Cards
  archiveCards: [CardSchema],
});

module.exports = mongoose.model("Board", BoardSchema);