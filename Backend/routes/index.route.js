import express from "express";
import hediyelerRoutes from "./hediyeler.route.js";
import ziyaretlerRoutes from "./ziyaretler.route.js";
import hediyeRoutes from "./hediye.route.js";
import HediyeTipleriRoutes from "./HediyeTipleri.route.js";
import HediyeTipDetayRoutes from "./HediyeTipDetay.route.js";
import authRoutes from "./auth.route.js";
import mediaRoutes from "./media.route.js";
import postsRoutes from "./posts.route.js";
import postTypeRoutes from "./postType.route.js";

const router = express.Router();

router.use("/hediyeler", hediyelerRoutes);
router.use("/ziyaretler", ziyaretlerRoutes);
router.use("/hediye", hediyeRoutes);
router.use("/hediye_tipleri", HediyeTipleriRoutes);
router.use("/hediye_tip_detay", HediyeTipDetayRoutes);
router.use("/auth", authRoutes);
router.use("/media", mediaRoutes);
router.use("/posts", postsRoutes);
router.use("/postType", postTypeRoutes);

export default router;
