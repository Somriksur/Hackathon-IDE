const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Mongoose model
const Question = require('../models/Question'); // ✅ No .js needed in CommonJS

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/questionpanel', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// API to create a question
app.post('/api/questions', async (req, res) => {
  try {
    const { title, description, input, output } = req.body;
    const question = await Question.create({ title, description, input, output });
    res.json({ id: question._id });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to create question');
  }
});

// API to get a question
app.get('/api/questions/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).send('Not found');
    res.json(question);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Serve question display page
app.get('/question/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running at http://localhost:3000');
});
