import { fromAuth, fromToken }from '../utils/auth';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

export default function Routes(app) {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
  app.post('/users/', UsersController.postNew);
  app.get('/users/me', fromToken, UsersController.getMe);
  app.get('/disconnect', fromToken, AuthController.getDisconnect);
  app.get('/connect', fromAuth, AuthController.getConnect);
}
