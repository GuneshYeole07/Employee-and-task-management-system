import mongoose from 'mongoose';

const Counter = mongoose.model(
  'Counter',
  new mongoose.Schema({ _id: String, seq: { type: Number, default: 0 } })
);

export const nextSequence = async (name) =>
  (await Counter.findByIdAndUpdate(name, { $inc: { seq: 1 } }, { new: true, upsert: true })).seq;
