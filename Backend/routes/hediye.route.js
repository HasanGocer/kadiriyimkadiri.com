import express from "express";
import { db } from "../db.js"; // db.js'den bağlantıyı alıyoruz

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM hediye ORDER BY olusturma_tarihi DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Hediyeleri Getirme Hatası:", error);
    res.status(500).json({ message: "Hediyeleri alırken bir hata oluştu." });
  }
});
router.get("/user/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT * FROM hediye WHERE user_id = ? ORDER BY olusturma_tarihi DESC",
      [user_id]
    );
    res.json(rows);
  } catch (error) {
    console.error("Kullanıcıya Göre Hediyeleri Getirme Hatası:", error);
    res.status(500).json({ message: "Hediyeleri alırken bir hata oluştu." });
  }
});
router.get("/status/:status", async (req, res) => {
  const { status } = req.params;
  const validStatus = ["beklemede", "onaylandı", "reddedildi"];

  // Geçerli status olup olmadığını kontrol et
  if (!validStatus.includes(status)) {
    return res.status(400).json({ message: "Geçersiz status değeri." });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM hediye WHERE status = ? ORDER BY olusturma_tarihi DESC",
      [status]
    );
    res.json(rows);
  } catch (error) {
    console.error("Status'a Göre Hediyeleri Getirme Hatası:", error);
    res.status(500).json({ message: "Hediyeleri alırken bir hata oluştu." });
  }
});
router.get("/onayli-hediyeler/:ziyaretId", async (req, res) => {
  const { ziyaretId } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT * FROM hediye 
       WHERE ziyaretler_id = ? 
       AND status = 'onaylandı'`,
      [ziyaretId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Onaylı hediyeler çekilirken hata oluştu:", error);
    res.status(500).json({ error: "Veritabanı hatası" });
  }
});
router.get("/by-ziyaret/:ziyaret_id", async (req, res) => {
  const { ziyaret_id } = req.params;
  try {
    const [hediyeler] = await db.query(
      `SELECT h.* FROM Hediyeler h
       JOIN HediyeTipDetay htd ON h.id = htd.hediye_id
       JOIN Ziyaretler z ON htd.hediye_tipi_id = z.hediye_tipi_id
       WHERE z.id = ?`,
      [ziyaret_id]
    );
    res.json(hediyeler);
  } catch (error) {
    console.error("Hediyeler getirme hatası:", error);
    res.status(500).json({ message: "Hediyeler getirilirken hata oluştu." });
  }
});

router.post("/", async (req, res) => {
  const { user_id, ziyaretler_id, hediyeler_id, sayi } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO hediye (user_id, ziyaretler_id, hediyeler_id, sayi,status) VALUES (?, ?, ?, ?, 'onaylandı')",
      [user_id, ziyaretler_id, hediyeler_id, sayi]
    );
    res
      .status(201)
      .json({ message: "Hediye başarıyla eklendi.", id: result.insertId });
  } catch (error) {
    console.error("Hediye Ekleme Hatası:", error);
    res.status(500).json({ message: "Hediye eklerken bir hata oluştu." });
  }
});
router.post("/havuz", async (req, res) => {
  const { user_id, ziyaretler_id, hediyeler_id, sayi } = req.body;

  try {
    const [result] = await db.query(
      "INSERT INTO hediye (user_id, ziyaretler_id, hediyeler_id, sayi, status) VALUES (?, ?, ?, ?, 'onaylandı')",
      [user_id, ziyaretler_id, hediyeler_id, sayi]
    );

    res.status(201).json({
      message: "Hediye başarıyla eklendi.",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Hediye Ekleme Hatası:", error);
    res.status(500).json({ message: "Hediye eklerken bir hata oluştu." });
  }
});

router.put("/update-status/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatus = ["onaylandı", "beklemede", "reddedildi"];

  if (!validStatus.includes(status)) {
    return res.status(400).json({ message: "Geçersiz durum değeri." });
  }

  try {
    await db.query("UPDATE hediye SET status = ? WHERE id = ?", [status, id]);
    res.json({ message: "Durum güncellendi." });
  } catch (error) {
    console.error("Hediye güncelleme hatası:", error);
    res.status(500).json({ message: "Güncelleme sırasında hata oluştu." });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { user_id, ziyaretler_id, hediyeler_id, sayi, status } = req.body;
  try {
    const [result] = await db.query(
      "UPDATE hediye SET user_id = ?, ziyaretler_id = ?, hediyeler_id = ?, sayi = ?, status = ? WHERE id = ?",
      [user_id, ziyaretler_id, hediyeler_id, sayi, status, id]
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

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM hediye WHERE id = ?", [id]);
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
router.delete(
  "/ziyaret/:ziyaretler_id/hediye/:hediyeler_id",
  async (req, res) => {
    const { ziyaretler_id, hediyeler_id } = req.params;

    try {
      const [result] = await db.query(
        "DELETE FROM hediye WHERE ziyaretler_id = ? AND hediyeler_id = ? AND status = 'onaylandı'",
        [ziyaretler_id, hediyeler_id]
      );

      if (result.affectedRows > 0) {
        res.json({ message: "Onaylı hediye kayıtları başarıyla silindi." });
      } else {
        res.json({ message: "Onaylı hediye kayıtları yok." });
      }
    } catch (error) {
      console.error("Hediye Silme Hatası:", error);
      res.status(500).json({ message: "Hediye silinirken bir hata oluştu." });
    }
  }
);

export default router;
