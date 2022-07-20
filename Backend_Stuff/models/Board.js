const mongoose = require("mongoose");

////////////////////////////////
// CardSchema
////////////////////////////////
const CommentSchema = new mongoose.Schema({
  commentValue: String,
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
  //===================================
});

const CardSchema = new mongoose.Schema({
  actionTitle: {
    type: String,
    default: "input Action Card title here",
  },
  actionDesc: {
    type: String,
    default: "input Action Card description here",
  },
  comments: [CommentSchema],
  // comments: {
  //   type: Array,
  // },
  status: {
    type: String,
    default: "toDo",
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

const BoardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      default: "input board description here",
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
  },
  { collections: "boards" }
);

module.exports = mongoose.model("Board", BoardSchema);
