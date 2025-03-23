/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import AuthController from '#controllers/auth_controller'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js';

router.get('/', async () => {
  return {
    hello: 'world',
  }
});



router.group(() => {
  router.group(() => {
    router.post('/login', [AuthController, 'login']);
    router.post('/register', [AuthController, 'register'])

    router.post('/logout', [AuthController, 'logout']).use([
      middleware.auth()
    ])

  }).prefix('/auth');
  router.get('/data', async () => {
    return {
      hello: 'world',
    }
  }).use([
    middleware.auth()
  ]);
}).prefix('/api');