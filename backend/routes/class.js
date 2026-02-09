// backend/routes/class.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware.js');
const ClassModel = require('../models/Class.js');
const upload = multer({ storage: multer.memoryStorage() });

async function findClassByKeySafe(classKey) {
  const normalized = decodeURIComponent(classKey).trim().toLowerCase();

  return ClassModel.findOne({
    classKey: { $regex: `^${normalized}$`, $options: 'i' }
  });
}

function makeClassKey(className, subjectCode) {
  return `${(className || '').trim().toLowerCase()}_${(subjectCode || '').trim().toLowerCase()}`;
}


/* Create class (teacher) */
router.post('/create', authMiddleware, requireRole('teacher'), async (req, res) => {
  try {
    const { className, subjectCode, description } = req.body;
    if (!className || !subjectCode) return res.status(400).json({ message: 'Missing fields' });
    const classKey = makeClassKey(className, subjectCode);
    const exists = await ClassModel.findOne({ classKey });
    if (exists) return res.status(400).json({ message: 'Class with same name+subject exists' });

    const newClass = await ClassModel.create({
      teacher: req.user._id,
      className: className.trim(),
      subjectCode: subjectCode.trim(),
      classKey,
      description
    });
    res.json({ message: 'Class created', newClass });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* Teacher: get their classes (no students) */
router.get('/mine', authMiddleware, requireRole('teacher'), async (req, res) => {
  try {
    const classes = await ClassModel.find({ teacher: req.user._id }).select('-students');
    res.json({ classes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* Deleting class card */
router.delete(
  "/:key",
  authMiddleware,
  requireRole("teacher"),
  async (req, res) => {
    try {
      const classKey = decodeURIComponent(req.params.key);

      console.log("Deleting Class with Key:", classKey);

      // ✅ Find class using classKey
      const existingClass = await ClassModel.findOne({ classKey });

      if (!existingClass) {
        return res.status(404).json({ message: "Class not found" });
      }

      // ✅ Ensure only the same teacher deletes
      if (existingClass.teacher.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Unauthorized delete attempt" });
      }

      // ✅ Delete the class
      await ClassModel.deleteOne({ classKey });

      res.json({ message: "Class deleted successfully" });
    } catch (err) {
      console.error("Delete Class Error:", err);
      res.status(500).json({ message: "Server error while deleting class" });
    }
  }
);

// ✅ GET /api/class/classes  (STUDENT DASHBOARD)
router.get(
  '/classes',
  authMiddleware,
  requireRole('student'),
  async (req, res) => {
    try {
      const email = (req.user.email || '').trim().toLowerCase();

      const classes = await ClassModel.find({
        students: {
          $elemMatch: {
            email,
            status: 'Joined'
          }
        }
      }).select('className subjectCode classKey createdAt');

      res.json({ classes });
    } catch (err) {
      console.error('GET CLASSES ERROR:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/* Get class details */
router.get('/:classKey', authMiddleware, async (req, res) => {
  try {
    const { classKey } = req.params;
    const cls = await ClassModel.findOne({ classKey }).populate('teacher', 'name email');
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    // if teacher -> return full details
    if (req.user.role === 'teacher' && cls.teacher._id.equals(req.user._id)) {
      return res.json({ class: cls });
    }

    // // if student -> check if student joined
    // if (req.user.role === 'student') {
    //   const joined = cls.students.some(s => s.email === req.user.email || s.rollNumber === req.user.rollNumber);
    //   if (!joined) return res.status(403).json({ message: 'You have not joined this class' });
    //   // return class info without other students
    //   const safe = {
    //     teacher: cls.teacher,
    //     className: cls.className,
    //     subjectCode: cls.subjectCode,
    //     classKey: cls.classKey,
    //     assignments: cls.assignments,
    //     createdAt: cls.createdAt
    //   };
    //   return res.json({ class: safe });
    // }
    if (req.user.role === 'student') {
  const joined = cls.students.some(
    s =>
      (s.email || '').toLowerCase() ===
      (req.user.email || '').toLowerCase() &&
      s.status === 'Joined'
  );

  if (!joined)
    return res.status(403).json({ message: 'You have not joined this class' });

  return res.json({
    class: {
      teacher: cls.teacher,
      className: cls.className,
      subjectCode: cls.subjectCode,
      classKey: cls.classKey,
      assignments: cls.assignments,
      createdAt: cls.createdAt
    }
  });
}

    res.status(403).json({ message: 'Forbidden' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

router.post(
  '/:classKey/upload-students',
  authMiddleware,
  requireRole('teacher'),
  upload.single('file'),
  async (req, res) => {
    try {
      const cls = await findClassByKeySafe(req.params.classKey);

      if (!cls) return res.status(404).json({ message: 'Class not found' });
      if (!cls.teacher.equals(req.user._id))
        return res.status(403).json({ message: 'Not your class' });
      if (!req.file)
        return res.status(400).json({ message: 'No file uploaded' });

      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      let records = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      // normalize headers
      records = records.map(row => {
        const normalized = {};
        Object.keys(row).forEach(k => {
          normalized[k.trim().toLowerCase()] = row[k];
        });
        return normalized;
      });

      const newStudents = [];
for (const r of records) {
  const roll = (r.rollnumber || r.roll || '').toString().trim();
  const name = (r.name || '').toString().trim();

  const emailKey = Object.keys(r).find(k => k.includes('mail'));
  const email = emailKey ? r[emailKey].toString().trim() : '';

  if (!roll) continue;

  const exists = cls.students.some(
    s => s.rollNumber?.toLowerCase() === roll.toLowerCase()
  );

  if (!exists) {
    cls.students.push({
      name,
      rollNumber: roll,
      email: email || null,
      status: 'Pending',
      joinedAt: null
    });
  }
}

      await cls.save();

      res.json({
        message: 'Excel uploaded successfully',
        added: newStudents.length,
        students: newStudents
      });

    } catch (err) {
      console.error('UPLOAD ERROR:', err);
      res.status(500).json({ message: 'Excel upload failed' });
    }
  }
);

/* Delete Single Student */
router.delete(
  '/:classKey/student/:rollNumber',
  authMiddleware,
  requireRole('teacher'),
  async (req, res) => {
    try {
      const decodedKey = decodeURIComponent(req.params.classKey)
        .trim()
        .toLowerCase();

      const rollNumber = req.params.rollNumber.trim().toLowerCase();

      const cls = await ClassModel.findOne({
        classKey: { $regex: `^${decodedKey}$`, $options: 'i' }
      });

      if (!cls) {
        return res.status(404).json({ message: 'Class not found' });
      }

      if (!cls.teacher.equals(req.user._id)) {
        return res.status(403).json({ message: 'Not your class' });
      }

      const initialLength = cls.students.length;

      cls.students = cls.students.filter(
        s => (s.rollNumber || '').toLowerCase() !== rollNumber
      );

      if (cls.students.length === initialLength) {
        return res.status(404).json({ message: 'Student not found' });
      }

      await cls.save();

      res.json({ message: 'Student removed successfully' });

    } catch (err) {
      console.error('DELETE STUDENT ERROR:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);


/* Delete all students */
router.delete(
  '/:classKey/students',
  authMiddleware,
  requireRole('teacher'),
  async (req, res) => {
    try {
      const decodedKey = decodeURIComponent(req.params.classKey)
        .trim()
        .toLowerCase();

      const cls = await ClassModel.findOne({
        classKey: { $regex: `^${decodedKey}$`, $options: 'i' }
      });

      if (!cls) {
        return res.status(404).json({ message: 'Class not found' });
      }

      if (!cls.teacher.equals(req.user._id)) {
        return res.status(403).json({ message: 'Not your class' });
      }

      cls.students = [];
      await cls.save();

      res.json({ message: 'All students removed successfully' });

    } catch (err) {
      console.error('DELETE ALL STUDENTS ERROR:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);
// Download student list (teacher)
router.get('/:classKey/download-students', authMiddleware, requireRole('teacher'), async (req, res) => {
  try {
    const { classKey } = req.params;

    const cls = await ClassModel.findOne({ classKey });
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    if (!cls.teacher.equals(req.user._id))
      return res.status(403).json({ message: 'Not your class' });

    // Create CSV rows
    const rows = [];
    rows.push('name,rollNumber,status,result');

    cls.students.forEach(s => {
      rows.push(
        `${(s.name || '').replace(/,/g, '')},${s.rollNumber},${s.status || ''},${s.result || ''}`
      );
    });

    const csvData = rows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${classKey}_students.csv"`);
    res.status(200).end(csvData);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post(
  '/join',
  authMiddleware,
  requireRole('student'),
  async (req, res) => {
    try {
      const { className, subjectCode } = req.body;
      const email = (req.user.email || '').trim().toLowerCase();

      if (!className || !subjectCode)
        return res.status(400).json({ message: 'Missing fields' });

      const classKey = makeClassKey(className, subjectCode);
      const cls = await findClassByKeySafe(classKey);

      if (!cls)
        return res.status(404).json({ message: 'Class not found' });

      // 🔥 EMAIL BASED MATCH
      const student = cls.students.find(
        s => (s.email || '').toLowerCase() === email
      );

      if (!student)
        return res.status(403).json({
          message: 'You are not added to this class by the teacher'
        });

      if (student.status === 'Joined')
        return res.status(400).json({ message: 'Already joined' });

      student.status = 'Joined';
      student.joinedAt = new Date();

      await cls.save();

      res.json({
        message: 'Class joined successfully',
        class: {
          className: cls.className,
          subjectCode: cls.subjectCode,
          classKey: cls.classKey
        }
      });

    } catch (err) {
      console.error('JOIN ERROR:', err);
      res.status(500).json({ message: 'Join failed' });
    }
  }
);

module.exports = router;