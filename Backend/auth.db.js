import mysql from "mysql2";

const db = mysql.createConnection({
  host: "185.48.180.206", // veya kullanılan veritabanı sunucusu
  user: "evpuser",
  password: "YeniSifren123!", // veritabanı şifrenizi buraya yazın
  database: "kadiriyim_db", // veritabanı ismini buraya yazın
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to the database");
});

export default db;
