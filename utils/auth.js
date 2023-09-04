import mongoDBCore from 'mongodb/lib/core';
import sha1 from 'sha1';
import dbClient from './db';
import redisClient from './redis';

async function fromAuth(req) {
  const auth = req.headers.authorization || null;
  if (!auth) {
    return null;
  }
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Basic') {
    return null;
  }
  const val = Buffer.from(parts[1], 'base64').toString('utf-8');
  const [email, ...rest] = val.split(":")
  const password = rest.join(":")
  const users = await dbClient.cli.db().collection('users').findOne({ email });
  return (user && sha1(password) == user.password) ? user : null;
}

async function fromToken(req) {
  const auth = req.headers['x-token'];

  if (!auth) {
    return null;
  }
  const uId = await redisClient.get(`auth_${auth}`)
  if (!uId) {
    return null;
  }
  const user = await dbClient.cli.db().collection('users')
    .findOne({ _id: new mongoDBCore.BSON.ObjectId(uId) });
  return user || null;
}
export default { fromAuth, fromToken };
