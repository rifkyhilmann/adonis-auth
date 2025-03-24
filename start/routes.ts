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
import UsersController from '#controllers/users_controller';

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

    router.post('/forgot-password', [AuthController, 'forgotPassword']);
    router.post('/reset-password', [AuthController, 'resetPassword']).use([
      middleware.auth()
    ]);

    router.get('/github', ({ ally }) => {
      return ally.use('github').redirect((request) => {
        request.scopes(['user:email', 'repo:invite']);
      });
    });
    router.get('/github/callback', [AuthController, 'githubCallback']);
    
    router.get('/google', ({ ally }) => {
      return ally.use('google').redirect();
    })
    router.get('/google/callback', [AuthController, 'googleCallback']);

  }).prefix('/auth');

  router.get('/data', async () => {
    return {
      hello: 'world',
    }
  }).use([
    middleware.auth()
  ]);

  router.get('/profile', [UsersController, 'getProfile']).use([
    middleware.auth()
  ])

}).prefix('/api');