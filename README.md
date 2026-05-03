# School_management_system_backend


CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15),
    password VARCHAR(255),
    gender VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    profile_image VARCHAR(255),
    status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
    role_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (role_id)
    REFERENCES roles(id)
);

CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    admission_no VARCHAR(50) UNIQUE,
    class_id INT,
    section_id INT,
    roll_no VARCHAR(20),
    admission_date DATE,
    blood_group VARCHAR(10),
    academic_year VARCHAR(20),
    FOREIGN KEY (user_id)
    REFERENCES users(id),
    FOREIGN KEY (class_id)
    REFERENCES classes(id),
    FOREIGN KEY (section_id)
    REFERENCES sections(id)
);

CREATE TABLE teachers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    qualification VARCHAR(100),
    experience INT,
    employee_code VARCHAR(50),
    subject_specialization VARCHAR(100),
    joining_date DATE,
    salary DECIMAL(10,2),
    emergency_contact VARCHAR(15),
    FOREIGN KEY (user_id)
    REFERENCES users(id)
);

CREATE TABLE parents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    occupation VARCHAR(100),
    emergency_contact VARCHAR(15),
    relation_with_student VARCHAR(50),
    FOREIGN KEY (user_id)
    REFERENCES users(id)
);

CREATE TABLE student_parents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    parent_id INT,
    relation ENUM(
        'Father',
        'Mother',
        'Guardian'
    ),

    FOREIGN KEY (student_id)
    REFERENCES students(id),
    FOREIGN KEY (parent_id)
    REFERENCES parents(id)
);

CREATE TABLE classes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50)
);

CREATE TABLE sections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT,
    name VARCHAR(10),
    class_teacher_id INT,
    FOREIGN KEY (class_id)
    REFERENCES classes(id),
    FOREIGN KEY (class_teacher_id)
    REFERENCES teachers(id)
);

CREATE TABLE subjects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100)
);

CREATE TABLE teacher_subjects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  teacher_id INT,
  subject_id INT,
  class_id INT,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (class_id) REFERENCES classes(id)
);

CREATE TABLE timetables (
  id INT PRIMARY KEY AUTO_INCREMENT,
  class_id INT,
  section_id INT,
  subject_id INT,
  teacher_id INT,
  day_of_week VARCHAR(10),
  start_time TIME,
  end_time TIME,
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (section_id) REFERENCES sections(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

CREATE TABLE attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT,
  date DATE,
  status ENUM('PRESENT','ABSENT'),
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE exams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  class_id INT,
  date DATE,
  FOREIGN KEY (class_id) REFERENCES classes(id)
);

CREATE TABLE marks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT,
  exam_id INT,
  subject_id INT,
  marks INT,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

CREATE TABLE fees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  class_id INT,
  amount DECIMAL(10,2),
  FOREIGN KEY (class_id) REFERENCES classes(id)
);

CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT,
  amount_paid DECIMAL(10,2),
  payment_date DATE,
  status VARCHAR(20),
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE notices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200),
  content TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sender_id INT,
  receiver_id INT,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
);