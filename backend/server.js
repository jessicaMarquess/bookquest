import cors from "cors";
import "dotenv/config";
import express from "express";
import swaggerUi from "swagger-ui-express";
import connectDB from "./config/db.js";
import swaggerSpec from "./config/swagger.js";
import Book from "./models/Book.js";
import authRoutes from "./routes/auth.js";
import bookRoutes from "./routes/books.js";
import profileRoutes from "./routes/profile.js";
import statsRoutes from "./routes/stats.js";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: { url: "/api-docs/swagger.json" },
  }),
);

app.get("/api-docs/swagger.json", (req, res) => {
  res.json(swaggerSpec);
});

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/stats", statsRoutes);

const PORT = process.env.PORT || 5000;

async function migrateFinishedAt() {
  const result = await Book.updateMany({ status: "lido", finishedAt: null }, [
    { $set: { finishedAt: "$createdAt" } },
  ]);
  if (result.modifiedCount > 0) {
    console.log(
      `Migração: ${result.modifiedCount} livro(s) com finishedAt preenchido via createdAt`,
    );
  }
}

connectDB().then(async () => {
  await migrateFinishedAt();
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
});

export default app;
