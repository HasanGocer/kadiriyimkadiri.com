import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../auth.db.js"; // Veritabanı bağlantısı

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
        { id: user.id, is_admin: user.is_admin },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ message: "Giriş başarılı", token, user });
    });
  });
});
router.post("/activate/:id", (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization?.split(" ")[1];

  // Token Doğrulama
  if (!token) return res.status(403).json({ message: "Token gerekli" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Geçersiz token" });
    if (!user.is_admin)
      return res.status(403).json({ message: "Yetkiniz yok" });

    // Kullanıcıyı Aktif Etme
    const query = "UPDATE users SET is_active = 1 WHERE id = ?";
    db.execute(query, [id], (err, result) => {
      if (err) return res.status(500).json({ message: "Veritabanı hatası" });
      res.json({ message: "Kullanıcı aktifleştirildi" });
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
router.get("/", (req, res) => {
  const query = "SELECT * FROM users";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json(results);
  });
});
router.put("/active/:id", (req, res) => {
  const userId = req.params.id;
  const { is_active } = req.body;

  const query = "UPDATE users SET is_active = ? WHERE id = ?";
  db.query(query, [is_active, userId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ message: "is_active updated successfully" });
  });
});
router.put("/admin/:id", (req, res) => {
  const userId = req.params.id;
  const { is_admin } = req.body;

  const query = "UPDATE users SET is_admin = ? WHERE id = ?";
  db.query(query, [is_admin, userId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ message: "is_admin updated successfully" });
  });
});

export default router;
