const { clearHash } = require('../services/cache');

module.exports = async (req, res, next) => {
  // A little trick, so that the middleware is called to clear hash after the routes function has successfully save the blogs
  // we await the next function/the route handler which is called before so that is runs before we clearHash
  await next();

  clearHash(req.user.id);
}
