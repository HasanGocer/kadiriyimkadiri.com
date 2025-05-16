import jwt from "jsonwebtoken";
import db from "../auth.db.js"; // DB bağlantını buradan çekiyorsan

export const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(403).json({ message: "Token gerekli" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Geçersiz token" });

        const userId = decoded.id;

        const query = "SELECT user_type FROM users WHERE id = ?";
        db.execute(query, [userId], (err, results) => {
            if (err) return res.status(500).json({ message: "Veritabanı hatası" });
            if (results.length === 0) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

            if (results[0].user_type !== "admin") {
                return res.status(403).json({ message: "Yetkiniz yok" });
            }

            req.user = decoded; // İleride kullanmak için ekleyebilirsin
            next();
        });
    });
};
