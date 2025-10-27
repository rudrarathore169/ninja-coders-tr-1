import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuCategory", required: true },
  availability: { type: Boolean, default: true },
  tags: { type: [String], default: [] },
  popularity: { type: Number, default: 0 },
  imageUrl: { type: String, default: "" }
}, { timestamps: true });

menuItemSchema.index({ categoryId: 1, name: 1 });
menuItemSchema.index({ name: "text", description: "text", tags: "text" });

export default mongoose.model("MenuItem", menuItemSchema);
