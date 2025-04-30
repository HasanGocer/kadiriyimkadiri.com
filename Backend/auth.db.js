import mysql from "mysql2";

const db = mysql.createConnection({
  host: "localhost", // veya kullanılan veritabanı sunucusu
  user: "evpuser",
  password: "güçlüşifre", // veritabanı şifrenizi buraya yazın
  database: "kadiriyim_db", // veritabanı ismini buraya yazın
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to the database");
});

export default db;
