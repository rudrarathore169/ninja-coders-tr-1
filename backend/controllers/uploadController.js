import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const uploadImage = async (req, res) => {
  try {
    console.log("📸 Received file:", req.file);

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "menu_items",
    });

    console.log("✅ Cloudinary upload success:", result.secure_url);

    // Remove temp file
    fs.unlinkSync(req.file.path);

    res.json({ success: true, imageUrl: result.secure_url });
  } catch (error) {
    console.error("❌ Cloudinary upload failed:", error);
    res.status(500).json({ success: false, message: "Upload failed", error });
  }
};
