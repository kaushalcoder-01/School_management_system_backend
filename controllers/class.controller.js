const User = require("../models/user.model");
const Class = require("../models/class.model");
const config = require("../config/config");
const Dashboard = require("../models/Dashboard.model");

exports.saveClass = async (req, res) => {
  try {
    const { id, name, sections = [] } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Class name is required",
      });
    }

    let classId;

    if (id) {
      await Class.updateClass({
        id,
        name
    });
      classId = id;
    } else {
      classId = await Class.insertClass(req.body);
      await Dashboard.addLog({
        activity_type: "CLASS",
        title: "Class Created",
        description: `${req.name} class created`,
        created_by: req.user.id,
      });
    }

    for (const section of sections) {
      if (section.class_teacher_id) {
        const assignedTeacher = await Class.checkTeacherAssigned(
          section.class_teacher_id,
          section.id || null,
        );

        if (assignedTeacher.length) {
          return res.status(400).json({
            success: false,
            message: `Teacher already assigned to ${assignedTeacher[0].class_name} - ${assignedTeacher[0].section_name}`,
          });
        }
      }

      if (section.id) {
        await Class.updateSection({
          id: section.id,
          class_id: classId,
          name: section.name,
          class_teacher_id: section.class_teacher_id,
        });
      } else {
        await Class.insertSection({
          class_id: classId,
          name: section.name,
          class_teacher_id: section.class_teacher_id,
        });
      }
    }
    return res.status(200).json({
      success: true,
      message: id ? "Class updated successfully" : "Class created successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getClassList = async (req, res) => {
  try {
    let classList = await Class.getClassList();

    res.status(200).json({
      success: true,
      data: classList,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

exports.getSectionList = async (req, res) => {
  try {
    let sectionList = await Class.getSectionList(req.body);
    res.status(200).json({
      success: true,
      data: sectionList,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

exports.classById = async (req, res) => {
  try {

    const rows = await Class.getClassById(req.query);

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Class not found"
      });
    }

    const response = {
      id: rows[0].classId,
      name: rows[0].name,
      sections: rows.map(row => ({
        id: row.section_id,
        name: row.section_name,
        class_teacher_id: row.class_teacher_id
      }))
    };

    return res.status(200).json({
      success: true,
      data: response
    });

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

exports.getTeachersForClass = async (req, res) => {
  try {
    const data = await Class.getTeachersForClass();

    const formatted = data.map((item) => ({
      id: item.id,
      name: item.name,
      is_assigned: !!item.section_id,
      assigned_section: item.assigned_section,
    }));
    res.json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};
