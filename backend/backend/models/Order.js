import mongoose from "mongoose";

const orderLineSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, min: 1 },
  note: { type: String, default: "" }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: "Table" },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  items: { type: [orderLineSchema], required: true },
  totals: { type: Number, required: true },
  status: { type: String, enum: ["placed","preparing","ready","served","canceled"], default: "placed" },
  meta: { qrSlug: String, deviceInfo: String }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
