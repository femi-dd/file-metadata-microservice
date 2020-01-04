const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Model = new Schema({
  username: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  }
});

const UserModel = mongoose.model('username', Model);

module.exports = UserModel;
