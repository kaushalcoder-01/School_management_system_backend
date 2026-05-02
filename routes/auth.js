const router             = require('express').Router();
const { loggedIn }       = require('../helpers/authmiddleware.helper');
const { isAdmin, isTeacherOrAdmin }       = require('../helpers/rolemiddleware.helper');
const userController     = require('../controllers/user.controller');
const teacherController  = require('../controllers/teacher.controller');
const parentController   = require('../controllers/parent.controller');

router.post('/login', userController.login);
router.post('/adduser', loggedIn, isAdmin, userController.addUser);


//teachers
router.post('/addteacher', loggedIn, isAdmin, teacherController.addTeacher);
//router.get('/userdetails', loggedIn, userController.getUserDetailsById);


//parents
router.post('/addparent', loggedIn, isTeacherOrAdmin, parentController.addParent);

module.exports = router;