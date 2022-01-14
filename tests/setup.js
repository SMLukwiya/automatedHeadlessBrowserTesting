/* This file is run after initializing jest but before actually running the test since jest requires some of the
  configurations in this file tom achieve success
*/
jest.setTimeout(15000)

require('../models/User');

const mongoose = require('mongoose');
const keys = require('../config/keys');

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI)
