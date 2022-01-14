const mongoose = require('mongoose');

const User = mongoose.model('User');

module.exports = () => {
  // returns a promise;
  return new User({}).save();
}
