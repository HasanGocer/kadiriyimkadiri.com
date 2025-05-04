import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import routes from "./routes/index.route.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { handleSocketIO } from "./socket/socket.js";

const app = express();
const port = process.env.PORT || 5000;

// __dirname tanımı
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CORS (her yerden istek kabul et — geliştirme için uygun)
app.use(cors());

// JSON veri yakalama
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Yüklenen dosyaları açığa çıkar (resim/video vs.)
app.use("/uploads", express.static(join(__dirname, "uploads")));

// ✅ React build klasörünü servis et
app.use(express.static(join(__dirname, "frontend", "build")));

// ✅ API route'ları
app.use("/api", routes);

// ✅ SPA fallback — React Router için
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "frontend", "build", "index.html"));
});

// ✅ Socket.IO kurulumu
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }, // local için herkese açık
});
handleSocketIO(io);

// Sunucuyu başlat
httpServer.listen(port, () => {
  console.log(`✅ Sunucu ${port} portunda çalışıyor...`);
});
