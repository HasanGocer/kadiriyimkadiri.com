import express from "express";
import { db } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM posts");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Postlar alınamadı" });
  }
});
router.post("/", async (req, res) => {
  try {
    const { user_id, post_type_id, title, content, is_published } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "user_id eksik" });
    }

    const [rows] = await db.query(
      "INSERT INTO posts (user_id, post_type_id, title, content, is_published) VALUES (?, ?, ?, ?, ?)",
      [user_id, post_type_id, title, content, is_published ?? false]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Post eklenemedi" });
  }
});
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, is_published } = req.body;

    await db.query(
      "UPDATE posts SET title = ?, content = ?, is_published = ? WHERE id = ?",
      [title, content, is_published ?? false, id]
    );

    res.json({ message: "Post güncellendi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Post güncellenemedi" });
  }
});
router.put("/update-status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { is_published } = req.body;

    if (typeof is_published !== "boolean") {
      return res
        .status(400)
        .json({ error: "'is_published' değeri boolean olmalıdır" });
    }

    await db.query("UPDATE posts SET is_published = ? WHERE id = ?", [
      is_published,
      id,
    ]);

    res.json({ message: "Post yayım durumu güncellendi" });
  } catch (err) {
    console.error("Post güncellenemedi:", err);
    res.status(500).json({ error: "Post güncellenemedi" });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM posts WHERE id = ?", [id]);

    res.json({ message: "Post silindi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Post silinemedi" });
  }
});

export default router;
