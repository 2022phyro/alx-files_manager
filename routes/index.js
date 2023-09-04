import Auth from '../utils/auth';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

export default function Routes(app) {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
  app.post('/users/', UsersController.postNew);
  app.get('/users/me', Auth.fromToken, UsersController.getMe);
  app.get('/disconnect', Auth.fromToken, AuthController.getDisconnect);
  app.get('/connect', Auth.fromAuth, AuthController.getConnect);
}
