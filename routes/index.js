import { middleFromAuth, middleFromToken } from '../utils/auth';
import AppController from '../controllers/AppController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';
import UsersController from '../controllers/UsersController';

export default function Routes(app) {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
  app.post('/users/', UsersController.postNew);
  app.get('/users/me', middleFromToken, UsersController.getMe);
  app.get('/disconnect', middleFromToken, AuthController.getDisconnect);
  app.get('/connect', middleFromAuth, AuthController.getConnect);
  app.post('/files', middleFromToken, FilesController.postUpload);
  app.get('/files:id', middleFromToken, FilesController.getShow);
  app.get('/files', middleFromToken, FilesController.getIndex);
}
