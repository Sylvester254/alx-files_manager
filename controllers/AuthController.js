const redisClient = require('../redisClient');
const { v4: uuidv4 } = require('uuid');
const sha1 = require('sha1');
const UserModel = require('../models/UserModel');

module.exports = {
  async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const [authType, authValue] = authHeader.split(' ');
    if (authType !== 'Basic') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const decodedAuthValue = Buffer.from(authValue, 'base64').toString();
    const [email, password] = decodedAuthValue.split(':');
    const hashedPassword = sha1(password);
    const user = await UserModel.findOne({ email, password: hashedPassword });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = uuidv4();
    const key = `auth_${token}`;
    redisClient.set(key, user._id, 'EX', 86400); // 24h expiration
    return res.status(200).json({ token });
  },

  async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    redisClient.del(key);
    return res.status(204).send();
  },
};
