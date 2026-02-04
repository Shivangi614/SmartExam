
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  name: { type: String, default: '' },
   email: { type: String }, 
  rollNumber: { type: String, required: true }, // store as original case but compare lowercased
  status: { type: String, enum: ['Pending','Joined'], default: 'Pending' },
  joinedAt: { type: Date, default: null },
  result: { type: Number, default: null }
}, { _id: false });

const assignmentSchema = new mongoose.Schema({
  title: String,
  description: String,
  createdAt: { type: Date, default: Date.now },
  dueDate: Date,
  attachments: [String]
}, { _id: false });

const classSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  className: { type: String, required: true },
  subjectCode: { type: String, required: true },
  classKey: { type: String, required: true, unique: true }, // className_subjectCode (lowercased)
  description: String,
  students: [studentSchema],
  assignments: [assignmentSchema],
  createdAt: { type: Date, default: Date.now }
});

// optional index for fast lookup by student roll (case-insensitive queries will use lowercasing in routes)
module.exports = mongoose.model('Class', classSchema);
