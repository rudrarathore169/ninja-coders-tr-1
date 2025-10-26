import mongoose from "mongoose";

const menuCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  displayOrder: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });
export default mongoose.model("MenuCategory", menuCategorySchema);
