import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import routes from "./routes/index.route.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const app = express();
const port = 5000;

// __dirname tanımı
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CORS (her yerden istek kabul et — geliştirme için uygun)
app.use(cors({
  origin: "185.48.180.206",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
}));

// JSON veri yakalama
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Yüklenen dosyaları açığa çıkar (resim/video vs.)
app.use("/uploads", express.static(join(__dirname, "uploads")));

// ✅ React build klasörünü servis et
app.use(express.static(join(__dirname, "build")));

// ✅ API route'ları
app.use("/api", routes);

// ✅ SPA fallback — React Router için
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "build", "index.html"));
});

const server = app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
