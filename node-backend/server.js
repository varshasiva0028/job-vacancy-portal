const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/test", (req, res) => {
    res.json({
        message: "Node.js Connected Successfully"
    });
});

app.listen(5000, () => {
    console.log("Node Server Running on Port 5000");
});