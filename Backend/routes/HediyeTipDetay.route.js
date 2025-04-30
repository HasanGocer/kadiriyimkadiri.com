import express from "express";
import { db } from "../db.js"; // db.js'den bağlantıyı alıyoruz

const router = express.Router();

// Tüm hediye tip detaylarını getir
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM HediyeTipDetay");
    res.json(rows);
  } catch (error) {
    console.error("Hediye Tip Detaylarını Getirme Hatası:", error);
    res
      .status(500)
      .json({ message: "Hediye tip detaylarını alırken bir hata oluştu." });
  }
});
router.get("/:ziyaretId", async (req, res) => {
  const { ziyaretId } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT htd.*
       FROM HediyeTipDetay htd
       JOIN Ziyaretler z ON z.hediye_tipi_id = htd.hediye_tipi_id
       WHERE z.id = ?`,
      [ziyaretId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Hediye Tip Detayları çekilirken hata oluştu:", error);
    res.status(500).json({ error: "Veritabanı hatası" });
  }
});
router.post("/", async (req, res) => {
  const { hediye_id, hediye_tipi_id } = req.body;

  if (!hediye_id || !hediye_tipi_id) {
    return res
      .status(400)
      .json({ message: "Hediye ID ve Hediye Tipi ID gereklidir." });
  }

  try {
    // 1. Önce aynı kombinasyonun olup olmadığını kontrol et
    const [existing] = await db.query(
      "SELECT id FROM HediyeTipDetay WHERE hediye_id = ? AND hediye_tipi_id = ?",
      [hediye_id, hediye_tipi_id]
    );

    if (existing.length > 0) {
      return res.status(201).json({
        message: "Hediye tip detayı başarıyla eklendi.",
        id: existing.insertId,
      });
    }

    // 2. Eğer aynı veri yoksa yeni kaydı ekle
    const [result] = await db.query(
      "INSERT INTO HediyeTipDetay (hediye_id, hediye_tipi_id) VALUES (?, ?)",
      [hediye_id, hediye_tipi_id]
    );

    res.status(201).json({
      message: "Hediye tip detayı başarıyla eklendi.",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Hediye Tip Detayı Ekleme Hatası:", error);
    res
      .status(500)
      .json({ message: "Hediye tip detayı eklerken bir hata oluştu." });
  }
});
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { hediye_id, hediye_tipi_id } = req.body;
  try {
    const [result] = await db.query(
      "UPDATE HediyeTipDetay SET hediye_id = ?, hediye_tipi_id = ? WHERE id = ?",
      [hediye_id, hediye_tipi_id, id]
    );
    if (result.affectedRows > 0) {
      res.json({ message: "Hediye tip detayı başarıyla güncellendi." });
    } else {
      res.status(404).json({ message: "Hediye tip detayı bulunamadı." });
    }
  } catch (error) {
    console.error("Hediye Tip Detayı Güncelleme Hatası:", error);
    res
      .status(500)
      .json({ message: "Hediye tip detayı güncellenirken bir hata oluştu." });
  }
});
router.delete("/:id", async (req, res) => {
  const { id } = req.params; // URL'den id parametresini al

  try {
    // 1. Önce id'ye göre ilgili hediye_id ve hediye_tipi_id'yi çek
    const [rows] = await db.query(
      "SELECT hediye_id, hediye_tipi_id FROM HediyeTipDetay WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Hediye tip detayı bulunamadı." });
    }

    const { hediye_id, hediye_tipi_id } = rows[0];

    // 2. Elde edilen hediye_id ve hediye_tipi_id'ye göre tüm eşleşen kayıtları sil
    const [deleteResult] = await db.query(
      "DELETE FROM HediyeTipDetay WHERE hediye_id = ? AND hediye_tipi_id = ?",
      [hediye_id, hediye_tipi_id]
    );

    if (deleteResult.affectedRows > 0) {
      res.json({ message: "İlgili hediye tip detayları başarıyla silindi." });
    } else {
      res
        .status(404)
        .json({ message: "Eşleşen başka hediye tip detayı bulunamadı." });
    }
  } catch (error) {
    console.error("Hediye Tip Detayları Silme Hatası:", error);
    res
      .status(500)
      .json({ message: "Hediye tip detayları silinirken bir hata oluştu." });
  }
});

export default router;
