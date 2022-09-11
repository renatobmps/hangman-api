const jwt = require('jsonwebtoken');

module.exports = {
  login: async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(403).json({ error: 'No token provided' });
    }

    try {
      const { id, name } = jwt.verify(authorization, process.env.JWT_SECRET);
      req.user = { id, name };
      next();
    } catch (error) {
      return res.status(403).json({ error: 'Invalid token' });
    }
  },
  admLogin: async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(403).json({ error: 'No token provided' });
    }

    try {
      const { id, name } = jwt.verify(authorization, process.env.JWT_SECRET);
      const admins = [
        'renatobmpsilva',
      ]
      if (!admins.includes(name)) return res.status(403).json({ error: "Invalid token" });
      req.user = { id, name };
      next();
    } catch (error) {
      return res.status(403).json({ error: 'Invalid token' });
    }
  },
};