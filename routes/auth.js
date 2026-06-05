const router             = require('express').Router();
const { loggedIn }       = require('../helpers/authmiddleware.helper');
const { isAdmin, isTeacherOrAdmin }       = require('../helpers/rolemiddleware.helper');
const userController     = require('../controllers/user.controller');
const teacherController  = require('../controllers/teacher.controller');
const parentController   = require('../controllers/parent.controller');
const studentController   = require('../controllers/student.controller');
const subjectController  = require('../controllers/subject.controller');
const classController    = require('../controllers/class.controller');
const dashboardController = require('../controllers/dashboard.controller')
const upload             = require('../helpers/uploadmiddleware.helper');

//dashboard
router.get('/summary', loggedIn, isTeacherOrAdmin, dashboardController.getDashboardSummary);
router.get('/activitylog', loggedIn, isTeacherOrAdmin, dashboardController.getActivityLog);
//user
router.post('/login', userController.login);
router.post( "/setup-password", userController.setupPassword);
router.post('/adduser', loggedIn, isAdmin, userController.addUser);

//teachers
router.post('/addteacher', loggedIn, isAdmin, upload.single('profile_image'),teacherController.addTeacher);
router.post('/editteacher/:id', loggedIn, isAdmin, upload.single('profile_image'),teacherController.updateTeacher);
router.get('/teacherlist', loggedIn,  isTeacherOrAdmin, teacherController.teacherListByClassAndSection);
router.get('/teacherdetails', loggedIn,  isTeacherOrAdmin, teacherController.getTeacherDetails);
router.get('/classteachersection', loggedIn,  isTeacherOrAdmin, teacherController.getClassTeacherSections);

//parents
router.post('/editparent/:id' ,loggedIn, isTeacherOrAdmin,upload.single('profile_image'),parentController.editParent);
router.post('/searchparent', loggedIn, isTeacherOrAdmin, parentController.searchParent);
router.get('/parentlist', loggedIn, isTeacherOrAdmin, parentController.parentList);
router.get('/parentdetails', loggedIn, parentController.parentDetailsById);

//students
router.post('/addstudent', loggedIn, isTeacherOrAdmin, upload.single('profile_image'),studentController.addStudent);
router.post('/editstudent/:id', loggedIn, isTeacherOrAdmin, upload.single('profile_image'),studentController.editStudent);
router.get('/studentdetails', loggedIn,  studentController.studentDetailsById);
router.get('/studentlist', loggedIn,  studentController.studentListByClassAndSection);
router.get('/markattendance', loggedIn, isTeacherOrAdmin, studentController.markAttendance);
router.get('/studentattendancelist', loggedIn,  studentController.studentAttendanceList);
router.post('/studentattendancebyid', loggedIn,  studentController.getStudentAttendanceById);

//subject
router.get('/subjectlist', loggedIn,  subjectController.getSubjectList);
router.post('/savesubject', loggedIn, isTeacherOrAdmin, subjectController.saveSubject);

//classes
router.get('/classlist', loggedIn, classController.getClassList);
router.post('/sectionlist', loggedIn, classController.getSectionList);
router.post('/saveclass', loggedIn, isTeacherOrAdmin, classController.saveClass);
router.get('/classteacherlist', loggedIn, isTeacherOrAdmin, classController.getTeachersForClass);
router.get('/classdetails', loggedIn, isTeacherOrAdmin, classController.classById);



module.exports = router;