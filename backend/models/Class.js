const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  rollNumber: String,
  result: { type: Number, default: null } // placeholder for exam score
},{ _id: false });

const assignmentSchema = new mongoose.Schema({
  title: String,
  description: String,
  createdAt: { type: Date, default: Date.now },
  dueDate: Date,
  attachments: [String] // file URLs / paths if you implement file storage
},{ _id: false });

const classSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  className: { type: String, required: true },
  subjectCode: { type: String, required: true },
  classKey: { type: String, required: true, unique: true }, // className_subjectCode
  description: String,
  students: [studentSchema],
  assignments: [assignmentSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Class', classSchema);
