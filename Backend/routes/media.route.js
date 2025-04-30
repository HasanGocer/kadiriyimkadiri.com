import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "../db.js";

const router = express.Router();

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.get("/", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM media");
  res.json(rows);
});
router.get("/post/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const [media] = await db.query("SELECT * FROM media WHERE post_id = ?", [
      postId,
    ]);
    res.json(media);
  } catch (err) {
    console.error("Media getirilemedi:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});
router.post("/upload/:postId", upload.single("media"), async (req, res) => {
  const postId = req.params.postId;
  const file = req.file;
  if (!file) return res.status(400).json({ message: "Dosya yok" });

  const type = getMediaType(file.mimetype);
  if (!type) return res.status(400).json({ message: "Geçersiz medya türü" });

  await db.execute(
    "INSERT INTO media (post_id, media_url, media_type) VALUES (?, ?, ?)",
    [postId, file.path, type]
  );
  res.json({ message: "Medya yüklendi", path: file.path });
});
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { media_type } = req.body;
  await db.execute("UPDATE media SET media_type = ? WHERE id = ?", [
    media_type,
    id,
  ]);
  res.json({ message: "Medya güncellendi" });
});
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await db.execute("DELETE FROM media WHERE id = ?", [id]);
  res.json({ message: "Medya silindi" });
});

function getMediaType(mime) {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  return null;
}

export default router;
