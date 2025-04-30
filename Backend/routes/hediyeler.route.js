import express from "express";
import { db } from "../db.js"; // db.js'den bağlantıyı alıyoruz

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM Hediyeler ORDER BY siralama ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Hediyeleri Getirme Hatası:", error);
    res.status(500).json({ message: "Hediyeleri alırken bir hata oluştu." });
  }
});
router.get("/:hediyeTipiId", async (req, res) => {
  const { hediyeTipiId } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT h.*
       FROM Hediyeler h
       JOIN HediyeTipDetay htd ON h.id = htd.hediye_id
       WHERE htd.hediye_tipi_id = ?`,
      [hediyeTipiId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Hediyeler çekilirken hata oluştu:", error);
    res.status(500).json({ error: "Veritabanı hatası" });
  }
});
router.get("/hediye/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM Hediyeler WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Hediye bulunamadı" });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Hediye getirilirken hata oluştu:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});
router.post("/", async (req, res) => {
  const { isim, aktiflik, user_id, siralama } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO Hediyeler (isim, aktiflik, user_id, siralama) VALUES (?, ?, ?, ?)",
      [isim, aktiflik, user_id, siralama]
    );
    res
      .status(201)
      .json({ message: "Hediye başarıyla eklendi.", id: result.insertId });
  } catch (error) {
    console.error("Hediye Ekleme Hatası:", error);
    res.status(500).json({ message: "Hediye eklerken bir hata oluştu." });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { isim, aktiflik, user_id, siralama } = req.body;
  try {
    const [result] = await db.query(
      "UPDATE Hediyeler SET isim = ?, aktiflik = ?, user_id = ?, siralama = ? WHERE id = ?",
      [isim, aktiflik, user_id, siralama, id]
    );
    if (result.affectedRows > 0) {
      res.json({ message: "Hediye başarıyla güncellendi." });
    } else {
      res.status(404).json({ message: "Hediye bulunamadı." });
    }
  } catch (error) {
    console.error("Hediye Güncelleme Hatası:", error);
    res.status(500).json({ message: "Hediye güncellenirken bir hata oluştu." });
  }
});
router.put("/update-modcount/:id", async (req, res) => {
  const { id } = req.params;
  const { modCount } = req.body;

  if (!id || modCount === undefined) {
    return res.status(400).json({ error: "id ve modCount zorunludur." });
  }

  try {
    const [result] = await db.execute(
      "UPDATE Hediyeler SET modCount = ? WHERE id = ?",
      [modCount, id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Belirtilen ID ile kayıt bulunamadı." });
    }

    res.json({ message: "modCount başarıyla güncellendi." });
  } catch (error) {
    console.error("Hediye Güncelleme Hatası:", error);
    res.status(500).json({ error: "Veritabanı hatası." });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM Hediyeler WHERE id = ?", [id]);
    if (result.affectedRows > 0) {
      res.json({ message: "Hediye başarıyla silindi." });
    } else {
      res.status(404).json({ message: "Hediye bulunamadı." });
    }
  } catch (error) {
    console.error("Hediye Silme Hatası:", error);
    res.status(500).json({ message: "Hediye silinirken bir hata oluştu." });
  }
});

export default router;
