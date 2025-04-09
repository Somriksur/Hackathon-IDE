const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const compiler = require("compilex");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 5000;
const SECRET_KEY = "your_secret_key";

const FRONTEND_PATH = "C:/Users/ASUS/Downloads/hackathon_ide/hackathon_ide";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(FRONTEND_PATH));

// CodeMirror static path
app.use("/codemirror-5.65.19", express.static("C:/Users/ASUS/OneDrive/Desktop/IDE/codemirror-5.65.19"));

// Compiler
compiler.init({ stats: true, options: { timeout: 5000 } });

// MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/ide_users", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Models
const User = mongoose.model("User", new mongoose.Schema({
    username: String,
    password: String,
}));

// JWT Middleware
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.redirect("auth.html");

    try {
        const verified = jwt.verify(token, SECRET_KEY);
        req.user = verified;
        next();
    } catch (error) {
        return res.redirect("auth.html");
    }
};

// Auth Routes
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.json({ message: "User created successfully!" });
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User not found!" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ message: "Invalid credentials!" });

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
});

// Protected IDE Route
app.get("/", verifyToken, (req, res) => {
    res.sendFile(path.join(FRONTEND_PATH, "index.html"));
});

// Code Compilation
app.post("/compile", (req, res) => {
    const { code, input, lang } = req.body;
    if (!code || !lang) return res.status(400).send({ error: "Code and language are required" });

    const envData = { OS: "windows", cmd: lang === "cpp" ? "g++" : undefined };

    const sendResponse = (data) => {
        res.send(data.output ? data : { output: "Compilation Error" });
    };

    try {
        if (lang === "cpp") {
            input ? compiler.compileCPPWithInput(envData, code, input, sendResponse)
                  : compiler.compileCPP(envData, code, sendResponse);
        } else if (lang === "java") {
            input ? compiler.compileJavaWithInput(envData, code, input, sendResponse)
                  : compiler.compileJava(envData, code, sendResponse);
        } else if (lang === "python") {
            input ? compiler.compilePythonWithInput(envData, code, input, sendResponse)
                  : compiler.compilePython(envData, code, sendResponse);
        } else {
            res.status(400).send({ error: "Unsupported language" });
        }
    } catch (error) {
        res.status(500).send({ error: "Compilation error", details: error.message });
    }
});

// Question Routes
app.get("/fetch-question/:id", async (req, res) => {
    const { id } = req.params;
    const response = await axios.get(`http://localhost:3000/api/questions/${id}`);
    res.json(response.data);
});

app.get("/question/:id", (req, res) => {
    res.sendFile(path.join(FRONTEND_PATH, "index.html"));
});

// Fallback route for SPA
app.get("*", (req, res) => {
    res.sendFile(path.join(FRONTEND_PATH, "index.html"));
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Clean shutdown
process.on("exit", () => {
    compiler.flush(() => console.log("Compiler flushed!"));
});
