require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./db/db");
const usersRouter = require("./routes/users");
const boardsRouter = require("./routes/boards");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

connectDB(process.env.DATABASE_URL);

app.use("/users", usersRouter);
app.use("/boards", boardsRouter);

app.listen(PORT, () => console.log(`Server Started on port: ${PORT}`));
