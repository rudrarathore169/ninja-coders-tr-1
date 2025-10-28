import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true },
  qrSlug: { type: String, required: true, unique: true },
  occupied: { type: Boolean, default: false },
  activeSessionId: { type: String, default: null }
}, { timestamps: true });
export default mongoose.model("Table", tableSchema);
