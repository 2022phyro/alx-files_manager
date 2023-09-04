import { middleFromAuth, middleFromToken } from '../utils/auth';
import AppController from '../controllers/AppController';
import AuthController from '../controllers/AuthController';
import UsersController from '../controllers/UsersController';

export default function Routes(app) {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
  app.post('/users/', UsersController.postNew);
  app.get('/users/me', middleFromToken, UsersController.getMe);
  app.get('/disconnect', middleFromToken, AuthController.getDisconnect);
  app.get('/connect', middleFromAuth, AuthController.getConnect);
}
