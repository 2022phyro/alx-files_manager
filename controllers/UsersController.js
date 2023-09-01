import dbClient from '../utils/db';
import crypto from 'crypto';

const UsersController = {
  async postNew (req, res) {
    const postData = req.body;
    if (!postData || !postData.email) {
      return res.status(400).send("Missing email");
    }
    if (!postData.password) {
      return res.status(400).send("Missing password");
    }
    const users = dbClient.cli.db().collection('users')
    if ( await users.findOne({ email : postData['email'] })) {
      return res.status(400).send("Already exist");
    }
    const hash = (data) => {
      const sha1Hash = crypto.createHash('sha1');
      sha1Hash.update(data);
      return sha1Hash.digest('hex');
    };

    postData['password'] = hash(postData['password']);
    const result = await users.insertOne(postData)
    return res.json({email: postData['email'], id: result.insertedId})
  }
}
export default UsersController;
