import express from "express";
import { db } from "../db.js"; // db.js'den bağlantıyı alıyoruz

const router = express.Router();

// Tüm hediye tiplerini getir
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM HediyeTipleri");
    res.json(rows);
  } catch (error) {
    console.error("Hediye Tiplerini Getirme Hatası:", error);
    res
      .status(500)
      .json({ message: "Hediye tiplerini alırken bir hata oluştu." });
  }
});

// Yeni bir hediye tipi ekle
router.post("/", async (req, res) => {
  const { isim } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO HediyeTipleri (isim) VALUES (?)",
      [isim]
    );
    res
      .status(201)
      .json({ message: "Hediye tipi başarıyla eklendi.", id: result.insertId });
  } catch (error) {
    console.error("Hediye Tipi Ekleme Hatası:", error);
    res.status(500).json({ message: "Hediye tipi eklerken bir hata oluştu." });
  }
});

// Hediye tipini güncelle
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { isim } = req.body;
  try {
    const [result] = await db.query(
      "UPDATE HediyeTipleri SET isim = ? WHERE id = ?",
      [isim, id]
    );
    if (result.affectedRows > 0) {
      res.json({ message: "Hediye tipi başarıyla güncellendi." });
    } else {
      res.status(404).json({ message: "Hediye tipi bulunamadı." });
    }
  } catch (error) {
    console.error("Hediye Tipi Güncelleme Hatası:", error);
    res
      .status(500)
      .json({ message: "Hediye tipi güncellenirken bir hata oluştu." });
  }
});

// Hediye tipini sil
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM HediyeTipleri WHERE id = ?", [
      id,
    ]);
    if (result.affectedRows > 0) {
      res.json({ message: "Hediye tipi başarıyla silindi." });
    } else {
      res.status(404).json({ message: "Hediye tipi bulunamadı." });
    }
  } catch (error) {
    console.error("Hediye Tipi Silme Hatası:", error);
    res
      .status(500)
      .json({ message: "Hediye tipi silinirken bir hata oluştu." });
  }
});

export default router;
