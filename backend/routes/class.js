// backend/routes/class.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware.js');
const ClassModel = require('../models/Class.js');
const upload = multer({ storage: multer.memoryStorage() });

function makeClassKey(className, subjectCode) {
  return `${(className||'').trim().toLowerCase()}_${(subjectCode||'').trim().toLowerCase()}`;
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


/* Get class details */
router.get('/:classKey', authMiddleware, async (req, res) => {
  try {
    const classKey = (req.params.classKey || '').toLowerCase();
    const cls = await ClassModel.findOne({ classKey }).populate('teacher','name email');
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    if (req.user.role === 'teacher' && cls.teacher._id.equals(req.user._id)) {
      return res.json({ class: cls });
    }

    if (req.user.role === 'student') {
      const userRoll = (req.user.rollNumber || '').toString().trim().toLowerCase();
      const joined = cls.students.some(s => (s.rollNumber||'').toString().trim().toLowerCase() === userRoll && s.status === 'Joined');
      if (!joined) return res.status(403).json({ message: 'You have not joined this class' });

      const safe = {
        teacher: cls.teacher,
        className: cls.className,
        subjectCode: cls.subjectCode,
        classKey: cls.classKey,
        assignments: cls.assignments,
        createdAt: cls.createdAt
      };
      return res.json({ class: safe });
    }

    res.status(403).json({ message: 'Forbidden' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* Upload students Excel (.xlsx) */
router.post('/:classKey/upload-students', authMiddleware, requireRole('teacher'), upload.single('file'), async (req, res) => {
  try {
    const classKey = (req.params.classKey || '').toLowerCase();
    const cls = await ClassModel.findOne({ classKey });
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    if (!cls.teacher.equals(req.user._id)) return res.status(403).json({ message: 'Not your class' });

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    let records = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    records = records.map(row => {
      const normalized = {};
      Object.keys(row).forEach(k => {
        normalized[k.toString().trim().toLowerCase()] = row[k];
      });
      return normalized;
    });

    const newStudents = [];
    for (const r of records) {
      const rollRaw = (r.rollnumber || r.roll || '').toString().trim();
      const nameRaw = (r.name || '').toString().trim();
      if (!rollRaw) continue;
      const rollLower = rollRaw.toLowerCase();
      const exists = cls.students.some(s => (s.rollNumber||'').toString().trim().toLowerCase() === rollLower);
      if (!exists) {
        cls.students.push({
          name: nameRaw,
          rollNumber: rollRaw,
          status: 'Pending',
          joinedAt: null
        });
        newStudents.push({ name: nameRaw, rollNumber: rollRaw, status: 'Pending' });
      }
    }

    await cls.save();
    return res.json({ message: 'Excel uploaded successfully', added: newStudents.length, newStudents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Excel upload failed' });
  }
});
 /*
// Download student list (teacher)
// GET /api/class/:classKey/download-students
*/
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
/* Delete all students */
router.delete('/:classKey/students', authMiddleware, requireRole('teacher'), async (req, res) => {
  try {
    const classKey = (req.params.classKey || '').toLowerCase();
    const cls = await ClassModel.findOne({ classKey });
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    if (!cls.teacher.equals(req.user._id)) return res.status(403).json({ message: 'Not your class' });

    cls.students = [];
    await cls.save();
    res.json({ message: 'Students cleared' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* Create assignment */
// router.post('/:classKey/assignment', authMiddleware, requireRole('teacher'), async (req, res) => {
//   try {
//     const classKey = (req.params.classKey || '').toLowerCase();
//     const { title, description, dueDate } = req.body;
//     const cls = await ClassModel.findOne({ classKey });
//     if (!cls) return res.status(404).json({ message: 'Class not found' });
//     if (!cls.teacher.equals(req.user._id)) return res.status(403).json({ message: 'Not your class' });

//     cls.assignments.push({ title, description, dueDate });
//     await cls.save();
//     res.json({ message: 'Assignment created', assignments: cls.assignments });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

/* Student join (Option A: only if roll exists in uploaded list) */
router.post('/join', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const { className, subjectCode, rollNumber } = req.body;
    if (!className || !subjectCode || !rollNumber) return res.status(400).json({ message: 'Missing fields' });
    const classKey = makeClassKey(className, subjectCode);
    const cls = await ClassModel.findOne({ classKey });
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    const rollLower = rollNumber.toString().trim().toLowerCase();
    const idx = cls.students.findIndex(s => (s.rollNumber||'').toString().trim().toLowerCase() === rollLower);
    if (idx === -1) {
      return res.status(400).json({ message: 'Your roll number is not in the teacher-uploaded list' });
    }

    cls.students[idx].status = 'Joined';
    cls.students[idx].joinedAt = new Date();
    if (!cls.students[idx].name) cls.students[idx].name = req.user.name || '';
    await cls.save();

    return res.json({ message: 'Joined class', classKey: cls.classKey });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
/* Student: get my joined classes (by rollNumber) */
router.get('/my', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const userRoll = (req.user.rollNumber || '').toString().trim().toLowerCase();
    const classes = await ClassModel.find({ 'students.rollNumber': { $exists: true } })
      .select('className subjectCode classKey teacher assignments students');

    const my = classes.filter(cls => {
      return cls.students.some(s => (s.rollNumber||'').toString().trim().toLowerCase() === userRoll && s.status === 'Joined');
    }).map(cls => ({
      className: cls.className,
      subjectCode: cls.subjectCode,
      classKey: cls.classKey,
      teacher: cls.teacher,
      assignments: cls.assignments
    }));

    res.json({ classes: my });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
