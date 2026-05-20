const router             = require('express').Router();
const { loggedIn }       = require('../helpers/authmiddleware.helper');
const { isAdmin, isTeacherOrAdmin }       = require('../helpers/rolemiddleware.helper');
const userController     = require('../controllers/user.controller');
const teacherController  = require('../controllers/teacher.controller');
const parentController   = require('../controllers/parent.controller');
const studentController   = require('../controllers/student.controller');
const upload             = require('../helpers/uploadmiddleware.helper');

router.post('/login', userController.login);
router.post( "/setup-password", userController.setupPassword);
router.post('/adduser', loggedIn, isAdmin, userController.addUser);


//teachers
router.post('/addteacher', loggedIn, isAdmin, teacherController.addTeacher);
router.post('/teacherlist', loggedIn, isTeacherOrAdmin, teacherController.teacherListByClassAndSection);
router.get(  '/classlist', loggedIn, isTeacherOrAdmin, teacherController.getClassList);
router.post(  '/sectionlist', loggedIn, isTeacherOrAdmin, teacherController.getSectionList);

//parents
router.post('/addparent', loggedIn, isTeacherOrAdmin, parentController.addParent);
router.post('/searchparent', loggedIn, isTeacherOrAdmin, parentController.searchParent);
router.get('/parentlist', loggedIn, isTeacherOrAdmin, parentController.parentList);
router.get('/parentdetails', loggedIn, isTeacherOrAdmin, parentController.parentDetailsById);

//students
router.post('/addstudent', loggedIn, isTeacherOrAdmin, upload.single('profile_image'),studentController.addStudent);
router.post('/editstudent/:id', loggedIn, isTeacherOrAdmin, upload.single('profile_image'),studentController.editStudent);
router.get('/studentdetails', loggedIn, isTeacherOrAdmin, studentController.studentDetailsById);
router.get('/studentlist', loggedIn, isTeacherOrAdmin, studentController.studentListByClassAndSection);
router.get('/markattendance', loggedIn, isTeacherOrAdmin, studentController.markAttendance);
router.get('/studentattendancelist', loggedIn, isTeacherOrAdmin, studentController.studentAttendanceList);
router.post('/studentattendancebyid', loggedIn, isTeacherOrAdmin, studentController.getStudentAttendanceById);



module.exports = router;