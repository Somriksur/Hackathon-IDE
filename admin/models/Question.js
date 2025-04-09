const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: String,
  description: String,
  input: String,
  output: String,
});

module.exports = mongoose.model('Question', questionSchema);
