const express = require("express");
const bodyParser = require("body-parser");
const compiler = require("compilex");

const app = express();
compiler.init({ stats: true, options: { timeout: 5000 } });


app.use(bodyParser.json());

app.use("/codemirror-5.65.19", express.static("C:/Users/ASUS/OneDrive/Desktop/IDE/codemirror-5.65.19")); // Serve static files

// Route to serve the main HTML file
app.get("/",(req,res)=>{
    res.sendFile("C:/Users/ASUS/OneDrive/Desktop/IDE/index.html")
})


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

// Start the server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});

// Graceful shutdown to clear temp files when server stops
process.on("exit", () => {
    compiler.flush(() => console.log("Compiler flushed!"));
});
