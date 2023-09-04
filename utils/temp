import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const AuthController = {
  async getConnect(req, res) {
    const auth = req.headers['Authorization']
    const basic = (auth) => {
      if (!(auth && typeof auth == 'string' && auth.startsWith('Basic '))) {
        return null;
      }
      return auth.slice(6);    
    }
    const decode_basic = (basicVal) => {
      if (!basicVal && typeof basicVal == 'string') {
        return null;
      }
      try {
        const val = Buffer.from(basicVal, 'base64').toString('utf-8');
        return val;
      } catch {
        return null;
      }
    
    }
    const extract = (decodedVal) => {
      if (!decodedVal && typeof decodedVal == 'string' && decodedVal.includes(":")) {
        return null;
      }
      const [ email, ...rest] = decodedVal.split(":")
      const password = rest.join(":");
      return { email, password };
    }
    const { email, password } = extract(decodeBasic(basic(auth)));
    if (!(email && password)) {
      return res.status(401).json({"error":"Unauthorized"});
    }
    const user = await dbClient.cli.db().collection('users').findOne({ email });
    if (!user || user.password !== sha1(password)) {
      return res.status(401).json({"error":"Unauthorized"});
    }
    const key = uuidv4()
    await redisClient.set(`auth_${key}`, user.id, 86400)
    return res.status(200).json({ 'token': key });
  },
  async getDisconnect(req, res) {
    const auth = req.headers['X-Token']
    if (!auth || typeof auth !== 'string') {
      return res.status(401).json({"error":"Unauthorized"});
    }
    const user = await redisClient.get(`auth_${auth}`)
    if (!user) {
      return res.status(401).json({"error":"Unauthorized"});
    }
    await redisClient.del(`auth_${auth}`);
    return res.status(204).json("")
  }
}
export default AuthController;
