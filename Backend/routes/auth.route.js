import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../auth.db.js"; // Veritabanı bağlantısı
import { verifyAdmin } from "../middlewares/verifyAdmin.js";

const router = express.Router();
const JWT_SECRET = "your_secret_key"; // Güvenli bir yerde sakla!

router.post("/register", (req, res) => {
  const { numara, isim, soyisim, password } = req.body;

  // Şifre Hashleme
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ message: "Şifre hashleme hatası" });

    // Veritabanına Kaydetme
    const query =
      "INSERT INTO users (numara, isim, soyisim, password) VALUES (?, ?, ?, ?)";
    db.execute(
      query,
      [numara, isim, soyisim, hashedPassword],
      (err, result) => {
        if (err) return res.status(500).json({ message: "Veritabanı hatası" });
        res.status(201).json({ message: "Kayıt başarılı" });
      }
    );
  });
});
router.post("/login", (req, res) => {
  const { numara, password } = req.body;

  // Kullanıcıyı numarasına göre bul
  const query = "SELECT * FROM users WHERE numara = ?";
  db.execute(query, [numara], (err, results) => {
    if (err) return res.status(500).json({ message: "Veritabanı hatası" });
    if (results.length === 0)
      return res.status(401).json({ message: "Kullanıcı bulunamadı" });

    const user = results[0];

    // Hesap aktif mi kontrolü
    if (!user.is_active) {
      return res.status(403).json({ message: "Hesabınız henüz aktif değil" });
    }

    // Şifre doğrulama
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ message: "Şifre kontrol hatası" });
      if (!isMatch) return res.status(401).json({ message: "Yanlış şifre" });

      // JWT Token oluştur
      const token = jwt.sign(
        { id: user.id, user_type: user.user_type },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ message: "Giriş başarılı", token, user });
    });
  });
});
router.get("/users/:id", (req, res) => {
  const userId = req.params.id;
  const query = "SELECT id, isim, soyisim FROM users WHERE id = ?";

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Database error: ", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(results[0]);
  });
});
router.get("/", verifyAdmin, (req, res) => {
  const query = "SELECT * FROM users";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json(results);
  });
});
router.put("/active/:id", verifyAdmin, (req, res) => {
  const userId = req.params.id;
  const { is_active } = req.body;

  const query = "UPDATE users SET is_active = ? WHERE id = ?";
  db.query(query, [is_active, userId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ message: "is_active updated successfully" });
  });
});
router.put("/usertype/:id", verifyAdmin, (req, res) => {
  const userId = req.params.id;
  const { user_type } = req.body;

  if (!['ihvan', 'moderator', 'admin'].includes(user_type)) {
    return res.status(400).json({ message: "Geçersiz user_type değeri" });
  }

  const query = "UPDATE users SET user_type = ? WHERE id = ?";
  db.execute(query, [user_type, userId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ message: "user_type başarıyla güncellendi" });
  });
});

export default router;
