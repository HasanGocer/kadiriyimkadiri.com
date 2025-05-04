import mysql from "mysql2/promise"; // mysql2/promise modülünü dahil ettik
import dotenv from "dotenv";

dotenv.config();

// MySQL veritabanı bağlantısı
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "evpuser",
  password: process.env.DB_PASSWORD || "YeniSifren123!",
  database: process.env.DB_NAME || "kadiriyim_db",
  port: process.env.DB_PORT || 3306,
});

db.getConnection()
  .then((connection) => {
    console.log("Veritabanına başarıyla bağlanıldı.");
    connection.release(); // Bağlantıyı serbest bırakıyoruz
  })
  .catch((err) => {
    console.error("Veritabanı bağlantı hatası:", err);
  });

export { db };
