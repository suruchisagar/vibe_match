const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/recommend", async (req, res) => {
  try {
    // React se aaya hua 'prompt' FastAPI ko bhej rahe hain
    const response = await axios.post(
      "http://127.0.0.1:5000/recommend",
      req.body,
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "ML server (FastAPI) is not responding." });
  }
});

app.listen(8080, () => console.log("Node Middleware is running on port 8080"));
