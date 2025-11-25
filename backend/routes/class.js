const express = require('express');
const router = express.Router();
const csv = require('csv-parse');
const multer = require('multer');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware.js');
const ClassModel = require('../models/Class.js');

// Use memory storage for small CSV files
const upload = multer({ storage: multer.memoryStorage() });

/*
Create a class (teacher only)
POST /api/class/create
body: { className, subjectCode, description }
headers: Authorization: Bearer <token>
*/
router.post('/create', authMiddleware, requireRole('teacher'), async (req, res) => {
  try {
    const { className, subjectCode } = req.body;
    if (!className || !subjectCode) return res.status(400).json({ message: 'Missing fields' });
    const classKey = `${className.trim()}_${subjectCode.trim()}`.toUpperCase();
    const exists = await ClassModel.findOne({ classKey });
    if (exists) return res.status(400).json({ message: 'Class with same name+subject exists' });

    const newClass = await ClassModel.create({
      teacher: req.user._id,
      className: className.trim(),
      subjectCode: subjectCode.trim(),
      classKey,
      
    });
    res.json({ message: 'Class created', newClass });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/*
Teacher: Get their classes
GET /api/class/mine
*/
router.get('/mine', authMiddleware, requireRole('teacher'), async (req, res) => {
  try {
    const classes = await ClassModel.find({ teacher: req.user._id }).select('-students'); // don't send student lists here
    res.json({ classes });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

/*
Get class details (teacher or student who joined)
GET /api/class/:classKey
*/
router.get('/:classKey', authMiddleware, async (req, res) => {
  try {
    const { classKey } = req.params;
    const cls = await ClassModel.findOne({ classKey }).populate('teacher','name email');
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    // if teacher -> return full details
    if (req.user.role === 'teacher' && cls.teacher._id.equals(req.user._id)) {
      return res.json({ class: cls });
    }

    // if student -> check if student joined
    if (req.user.role === 'student') {
      const joined = cls.students.some(s => s.email === req.user.email || s.rollNumber === req.user.rollNumber);
      if (!joined) return res.status(403).json({ message: 'You have not joined this class' });
      // return class info without other students
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
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

/*
Upload students CSV (teacher)
POST /api/class/:classKey/upload-students
form-data: file (CSV)
CSV columns: name,email,rollNumber
*/
router.post('/:classKey/upload-students', authMiddleware, requireRole('teacher'), upload.single('file'), async (req, res) => {
  try {
    const { classKey } = req.params;
    const cls = await ClassModel.findOne({ classKey });
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    if (!cls.teacher.equals(req.user._id)) return res.status(403).json({ message: 'Not your class' });

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // parse CSV
    csv.parse(req.file.buffer.toString(), { columns: true, trim: true }, async (err, records) => {
      if (err) return res.status(400).json({ message: 'CSV parse error' });
      // expected fields: name,email,rollNumber
      const newStudents = [];
      for (const r of records) {
        if (!r.email) continue;
        const s = {
          name: r.name || '',
          email: r.email.toLowerCase(),
          rollNumber: r.rollNumber || ''
        };
        // avoid duplicates
        if (!cls.students.some(st => st.email === s.email || st.rollNumber === s.rollNumber)) {
          cls.students.push(s);
          newStudents.push(s);
        }
      }
      await cls.save();
      res.json({ message: 'Uploaded', added: newStudents.length, newStudents });
    });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

/*
Download student list (teacher)
GET /api/class/:classKey/download-students
*/
router.get('/:classKey/download-students', authMiddleware, requireRole('teacher'), async (req, res) => {
  try {
    const { classKey } = req.params;
    const cls = await ClassModel.findOne({ classKey });
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    if (!cls.teacher.equals(req.user._id)) return res.status(403).json({ message: 'Not your class' });

    // build CSV
    const rows = ['name,email,rollNumber,result'];
    for (const s of cls.students) {
      rows.push(`${(s.name||'').replace(/,/g,'')},${s.email},${s.rollNumber},${s.result ?? ''}`);
    }
    res.header('Content-Type','text/csv');
    res.attachment(`${cls.classKey}_students.csv`);
    res.send(rows.join('\n'));
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

/*
Delete all students from a class (teacher)
DELETE /api/class/:classKey/students
*/
router.delete('/:classKey/students', authMiddleware, requireRole('teacher'), async (req, res) => {
  try {
    const { classKey } = req.params;
    const cls = await ClassModel.findOne({ classKey });
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    if (!cls.teacher.equals(req.user._id)) return res.status(403).json({ message: 'Not your class' });

    cls.students = [];
    await cls.save();
    res.json({ message: 'Students cleared' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

/*
Create assignment (teacher)
POST /api/class/:classKey/assignment
body: { title, description, dueDate }
*/
router.post('/:classKey/assignment', authMiddleware, requireRole('teacher'), async (req, res) => {
  try {
    const { classKey } = req.params;
    const { title, description, dueDate } = req.body;
    const cls = await ClassModel.findOne({ classKey });
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    if (!cls.teacher.equals(req.user._id)) return res.status(403).json({ message: 'Not your class' });

    cls.assignments.push({ title, description, dueDate });
    await cls.save();
    res.json({ message: 'Assignment created', assignments: cls.assignments });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

/*
Student: join class using className + subjectCode
POST /api/class/join
body: { className, subjectCode }
*/
router.post('/join', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const { className, subjectCode } = req.body;
    if (!className || !subjectCode) return res.status(400).json({ message: 'Missing fields' });
    const classKey = `${className.trim()}_${subjectCode.trim()}`.toUpperCase();
    const cls = await ClassModel.findOne({ classKey });
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    // add student if not present
    const already = cls.students.some(s => s.email === req.user.email || (s.rollNumber && s.rollNumber === req.user.rollNumber));
    if (!already) {
      cls.students.push({ name: req.user.name, email: req.user.email, rollNumber: req.user.rollNumber || '' });
      await cls.save();
    }
    res.json({ message: 'Joined class', classKey });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

/*
Student: get my joined classes
GET /api/class/my
*/
router.get('/my', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const classes = await ClassModel.find({ 'students.email': req.user.email }).select('className subjectCode classKey teacher assignments');
    res.json({ classes });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
