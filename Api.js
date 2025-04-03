const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bodyParser = require("body-parser");
const compiler = require("compilex");

const app = express();
const PORT = 5000;
const SECRET_KEY = "your_secret_key"; // Keep this secure!

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Initialize compiler
compiler.init({ stats: true, options: { timeout: 5000 } });

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/ide_users", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// User Schema
const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
});
const User = mongoose.model("User", UserSchema);

// Middleware to verify JWT token
const path = require("path"); // Required for serving static files
app.use(express.static(__dirname));
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.redirect("auth.html"); // Redirect to login page if no token
    }

    try {
        const verified = jwt.verify(token, SECRET_KEY);
        req.user = verified;
        next();
    } catch (error) {
        return res.redirect("auth.html"); // Redirect if token is invalid
    }
};





// === Authentication Routes === //

// Signup Route
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.json({ message: "User created successfully!" });
});

// Login Route
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.status(400).json({ message: "User not found!" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ message: "Invalid credentials!" });

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
});

// === Protected Routes === //

// Serve IDE only if user is logged in
app.get("/", verifyToken, (req, res) => {
    res.sendFile("C:/Users/ASUS/Downloads/hackathon_ide/hackathon_ide/index.html");
});

// Route to serve static files (CodeMirror)
app.use("/codemirror-5.65.19", express.static("C:/Users/ASUS/OneDrive/Desktop/IDE/codemirror-5.65.19"));

// Function to compile code based on language and input type
const compileCode = (lang, code, input, res) => {
    let envData = { OS: "windows" }; // Default environment setup

    try {
        // Check language and set compiler options
        if (lang == "cpp") {
            envData.cmd = "g++"; // Use g++ for C++ compilation

            if (!input) {
                // Compile C++ without input
                compiler.compileCPP(envData, code, (data) => {
                    if (data.output) {
                        res.send(data);
                    } else {
                        res.send({ output: "Compilation Error" });
                    }
                });
            } else {
                // Compile C++ with input
                compiler.compileCPPWithInput(envData, code, input, (data) => {
                    if (data.output) {
                        res.send(data);
                    } else {
                        res.send({ output: "Compilation Error" });
                    }
                });
            }
        } 
        
        else if (lang == "java") {
            if (!input) {
                // Compile Java without input
                compiler.compileJava(envData, code, (data) => {
                    if (data.output) {
                        res.send(data);
                    } else {
                        res.send({ output: "Compilation Error" });
                    }
                });
            } else {
                // Compile Java with input
                compiler.compileJavaWithInput(envData, code, input, (data) => {
                    if (data.output) {
                        res.send(data);
                    } else {
                        res.send({ output: "Compilation Error" });
                    }
                });
            }
        } 
        
        else if (lang =="python") {
            if (!input) {
                // Compile Python without input
                compiler.compilePython(envData, code, (data) => {
                    if (data.output) {
                        res.send(data);
                    } else {
                        res.send({ output: "Compilation Error" });
                    }
                });
            } else {
                // Compile Python with input
                compiler.compilePythonWithInput(envData, code, input, (data) => {
                    if (data.output) {
                        res.send(data);
                    } else {
                        res.send({ output: "Compilation Error" });
                    }
                });
            }
        } 
        
        else {
            // If language is not supported
            res.status(400).send({ error: "Unsupported language" });
        }

    } catch (error) {
        // Catch and handle any unexpected compilation errors
        res.status(500).send({ error: "Compilation error", details: error.message });
    }
};

// Route to handle code compilation
app.post("/compile", (req, res) => {
    const { code, input, lang } = req.body;

    if (!code || !lang) {
        return res.status(400).send({ error: "Code and language are required" });
    }

    compileCode(lang, code, input, res);
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Graceful shutdown
process.on("exit", () => {
    compiler.flush(() => console.log("Compiler flushed!"));
});

