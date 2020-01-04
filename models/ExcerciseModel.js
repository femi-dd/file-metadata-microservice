const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Model = new Schema({
  userId: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true
  }
});

const ExerciseModel = mongoose.model('excercise', Model);

module.exports = ExerciseModel;
