const crypto = require('crypto');
const dbClient = require('../utils/db');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }

    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }

    const existingUser = await dbClient.getUserByEmail(email);

    if (existingUser) {
      res.status(400).json({ error: 'Already exist' });
      return;
    }

    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

    const newUser = await dbClient.createUser(email, hashedPassword);

    res.status(201).json({
      id: newUser._id,
      email: newUser.email,
    });
  }
}

module.exports = UsersController;
