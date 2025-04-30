import express from "express";
import { db } from "../db.js";

const router = express.Router();

// GET - Tüm post tiplerini getir
router.get("/", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM posttype");
  res.json(rows);
});

// POST - Yeni post tipi ekle
router.post("/", async (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== "string") {
    return res
      .status(400)
      .json({ error: "Geçerli bir 'name' değeri gereklidir." });
  }

  try {
    const [result] = await db.query("INSERT INTO posttype (isim) VALUES (?)", [
      name,
    ]);

    const [newItem] = await db.query("SELECT * FROM posttype WHERE id = ?", [
      result.insertId,
    ]);

    res.status(201).json(newItem[0]);
  } catch (err) {
    console.error("Post type ekleme hatası:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// PUT - Post tipini güncelle
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { isim } = req.body;
  await db.execute("UPDATE postType SET isim = ? WHERE id = ?", [isim, id]);
  res.json({ message: "Post tipi güncellendi" });
});

// DELETE - Post tipini sil
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await db.execute("DELETE FROM posttype WHERE id = ?", [id]);
  res.json({ message: "Post tipi silindi" });
});

export default router;
