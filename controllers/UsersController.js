import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const UsersController = {
  async postNew(req, res) {
    const email = req.body ? req.body.email : null;
    console.log(email);
    const password = req.body ? req.body.password : null;
    console.log(password);
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }
    const users = dbClient.cli.db().collection('users');
    if (await users.findOne({ email })) {
      return res.status(400).json({ error: 'Already exist' });
    }
    const hashed = sha1(password);

    const result = await users.insertOne({ email, password: hashed });
    return res.status(201).json({ email, id: result.insertedId.toString() });
  },

  async getMe(req, res) {
    const auth = req.headers['X-Token'];
    if (!auth || typeof auth !== 'string') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await redisClient.get(`auth_${auth}`);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const actualUser = await dbClient.cli.db().collection('users').findOne({ _id: user });
    if (!actualUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.json({ email: actualUser.email, id: actualUser._id });
  },

};
export default UsersController;
