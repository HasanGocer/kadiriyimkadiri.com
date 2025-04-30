import express from "express";
import { db } from "../db.js"; // db.js'den bağlantıyı alıyoruz

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM Ziyaretler ORDER BY siralama ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Ziyaretleri Getirme Hatası:", error);
    res.status(500).json({ message: "Ziyaretleri alırken bir hata oluştu." });
  }
});
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM Ziyaretler WHERE id = ?", [
      id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Ziyaret bulunamadı" });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Ziyaret getirilirken hata oluştu:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

router.post("/", async (req, res) => {
  const { isim, aktiflik, user_id, siralama, hediye_tipi_id } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO Ziyaretler (isim, aktiflik, user_id, siralama, hediye_tipi_id) VALUES (?, ?, ?, ?, ?)",
      [isim, aktiflik, user_id, siralama, hediye_tipi_id]
    );
    res
      .status(201)
      .json({ message: "Ziyaret başarıyla eklendi.", id: result.insertId });
  } catch (error) {
    console.error("Ziyaret Ekleme Hatası:", error);
    res.status(500).json({ message: "Ziyaret eklerken bir hata oluştu." });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { isim, aktiflik, user_id, siralama, hediye_tipi_id } = req.body;
  try {
    const [result] = await db.query(
      "UPDATE Ziyaretler SET isim = ?, aktiflik = ?, user_id = ?, siralama = ?, hediye_tipi_id = ? WHERE id = ?",
      [isim, aktiflik, user_id, siralama, hediye_tipi_id, id]
    );
    if (result.affectedRows > 0) {
      res.json({ message: "Ziyaret başarıyla güncellendi." });
    } else {
      res.status(404).json({ message: "Ziyaret bulunamadı." });
    }
  } catch (error) {
    console.error("Ziyaret Güncelleme Hatası:", error);
    res
      .status(500)
      .json({ message: "Ziyaret güncellenirken bir hata oluştu." });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM Ziyaretler WHERE id = ?", [
      id,
    ]);
    if (result.affectedRows > 0) {
      res.json({ message: "Ziyaret başarıyla silindi." });
    } else {
      res.status(404).json({ message: "Ziyaret bulunamadı." });
    }
  } catch (error) {
    console.error("Ziyaret Silme Hatası:", error);
    res.status(500).json({ message: "Ziyaret silinirken bir hata oluştu." });
  }
});

export default router;
