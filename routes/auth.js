const router             = require('express').Router();
const { loggedIn }       = require('../helpers/authmiddleware.helper');
const { isAdmin, isTeacherOrAdmin }       = require('../helpers/rolemiddleware.helper');
const userController     = require('../controllers/user.controller');
const teacherController  = require('../controllers/teacher.controller');
const parentController   = require('../controllers/parent.controller');
const studentController   = require('../controllers/student.controller');

router.post('/login', userController.login);
router.post('/adduser', loggedIn, isAdmin, userController.addUser);


//teachers
router.post('/addteacher', loggedIn, isAdmin, teacherController.addTeacher);
router.post('/teacherlist', loggedIn, isTeacherOrAdmin, teacherController.teacherListByClassAndSection);



//parents
router.post('/addparent', loggedIn, isTeacherOrAdmin, parentController.addParent);

//students
router.post('/addstudent', loggedIn, isTeacherOrAdmin, studentController.addStudent);
router.get('/studentdetails', loggedIn, isTeacherOrAdmin, studentController.studentDetailsById);
router.post('/studentlist', loggedIn, isTeacherOrAdmin, studentController.studentListByClassAndSection);

module.exports = router;