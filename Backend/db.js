import mysql from "mysql2/promise"; // mysql2/promise modülünü dahil ettik


// MySQL veritabanı bağlantısı
const db = mysql.createPool({
  host: "185.48.180.206",
  user: "evpuser",
  password: "YeniSifren123!",
  database: "kadiriyim_db",
  port: 3306,
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
