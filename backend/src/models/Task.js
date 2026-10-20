import mongoose from 'mongoose';
import { DEPARTMENTS, PRIORITIES, PRIORITY_RANK, TASK_STATUSES } from '../utils/constants.js';

// Denormalised copy of the assignee, so history stays readable after the employee is deleted.
const employeeSnapshotSchema = new mongoose.Schema(
  { employeeId: String, fullName: String, email: String, department: String, role: String },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    taskId: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    employeeSnapshot: { type: employeeSnapshotSchema, required: true },
    employeeDeleted: { type: Boolean, default: false },
    department: { type: String, enum: DEPARTMENTS, required: true },
    priority: { type: String, enum: PRIORITIES, required: true },
    priorityRank: { type: Number, required: true }, // lets the DB sort by importance, not alphabetically
    status: { type: String, enum: TASK_STATUSES, default: 'Todo' },
    startDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

taskSchema.pre('validate', function setRank(next) {
  this.priorityRank = PRIORITY_RANK[this.priority];
  next();
});
taskSchema.index({ employee: 1, status: 1 });
taskSchema.index({ status: 1, dueDate: 1 });
taskSchema.index({ createdAt: -1 });

export default mongoose.model('Task', taskSchema);
