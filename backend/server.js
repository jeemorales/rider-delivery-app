import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";


import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import customerRoutes from "./routes/customer.route.js"
import deliveryRoutes from "./routes/delivery.route.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();


// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/delivery", deliveryRoutes);


if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

//START SERVER
app.listen(PORT, async () => {
  try {
    await connectDB();
    console.log(`✅ Server running on http://localhost:${PORT}`);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
});