const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    const uri = `mongodb://${host}:${port}/${database}`;

    this.client = new MongoClient(uri, { useUnifiedTopology: true });
    this.client.connect((err) => {
      if (err) {
        console.log('Connection error:', err);
      } else {
        console.log('Connection to database established');
      }
    });
  }

  isAlive() {
    return !!this.client && !!this.client.topology && this.client.topology.isConnected();
  }

  async nbUsers() {
    const collection = this.client.db().collection('users');
    const count = await collection.countDocuments();
    return count;
  }

  async nbFiles() {
    const collection = this.client.db().collection('files');
    const count = await collection.countDocuments();
    return count;
  }

  async createUser(email, password) {
    const collection = this.client.db().collection('users');
    const result = await collection.insertOne({ email, password });
    return result.ops[0];
  }

  async getUserByEmail(email) {
    const collection = this.client.db().collection('users');
    const user = await collection.findOne({ email });
    return user;
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
