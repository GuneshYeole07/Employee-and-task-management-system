import mongoose from 'mongoose';
import { DEPARTMENTS, EMPLOYEE_STATUSES } from '../utils/constants.js';

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true, trim: true, uppercase: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    department: { type: String, enum: DEPARTMENTS, required: true },
    role: { type: String, required: true, trim: true },
    joiningDate: { type: Date, required: true },
    status: { type: String, enum: EMPLOYEE_STATUSES, default: 'Active' },
    skills: { type: [String], default: [] },
    leaveStartDate: { type: Date, default: null },
    leaveEndDate: { type: Date, default: null },
    // Atomic counter of Todo + In Progress tasks. Enforces the capacity rule under concurrency.
    activeTaskCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

employeeSchema.pre('validate', function checkLeave(next) {
  if (this.status === 'On Leave') {
    if (!this.leaveStartDate || !this.leaveEndDate) {
      return next(new Error('Leave start and end dates are required when status is On Leave.'));
    }
    if (this.leaveEndDate < this.leaveStartDate) {
      return next(new Error('Leave end date cannot be earlier than leave start date.'));
    }
  } else {
    this.leaveStartDate = null;
    this.leaveEndDate = null;
  }
  return next();
});

export default mongoose.model('Employee', employeeSchema);
