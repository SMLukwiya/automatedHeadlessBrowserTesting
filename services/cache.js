const mongoose = require('mongoose');
const Redis = require('ioredis');
const util = require('util')

const redisUrl = 'redis://127.0.0.1:6379';
const client = new Redis(redisUrl);
client.hget = util.promisify(client.hget).bind(client);

const exec = mongoose.Query.prototype.exec;

// add cache function to the exec prototype function
mongoose.Query.prototype.cache = function(options = {}) {
  // setting property usecache(random property) in query prototype
  this.useCache = true;

  // assign options key to haskkey(random name)
  this.hashKey = JSON.stringify(options.key || '')
  return this;
}

mongoose.Query.prototype.exec = async function () {
  // check the condition of the useCache property
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  // copy the get query result to an empty object so as not to modify the actual query by modifying the actual object;\
  // stringify the key to fit in redis rules
  const key = JSON.stringify(Object.assign({}, this.getQuery(), {
    collection: this.mongooseCollection.name
  }));

  // See if we have a value of key in redis
  const cachedValue = await client.hget(this.hashKey, key);

  // If we do, returh that
  if (cachedValue) {
    const doc = JSON.parse(cachedValue);
    // turn the cachedValue from a JSON representation of the model to a mongoose document model which the app currently expects
    // check if doc is array or simple object
    return Array.isArray(doc)
      ?  doc.map(d => new this.model(d))
      : new this.model(doc);
  }

  // Otherwise , issue the query and store the value in redis

  const result = await exec.apply(this, arguments);

  // turn result into JSON
  client.hset(this.hashKey, key, JSON.stringify(result));

  return result;
}

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey))
  }
}
