const router             = require('express').Router();
const { loggedIn }       = require('../helpers/authmiddleware.helper');
const userController     = require('../controllers/user.controller');

router.post('/login', userController.login);
router.post('/adduser', userController.addUser);
//router.get('/userdetails', loggedIn, userController.getUserDetailsById);

module.exports = router;