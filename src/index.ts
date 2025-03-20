import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.get("/", (req, res) => {
    res.send("Hello World!");
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log("Server started on port " + port);
});