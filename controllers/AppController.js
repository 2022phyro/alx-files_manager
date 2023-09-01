import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const AppController = {
  async getStatus(req, res) {
    const r_stat = await redisClient.isAlive();
    const d_stat = await dbClient.isAlive();
    res.json({'redis' : r_stat, 'db': d_stat });
  },
  async getStats(req, res) {
    const u_count = await dbClient.nbUsers();
    const f_count = await dbClient.nbFiles();
    res.json({ 'users': u_count, 'files': f_count })
  }
}
export default AppController;
