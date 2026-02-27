import { Router } from "express";
import auth from "../middleware/auth.js";
import Book from "../models/Book.js";

const router = Router();

router.use(auth);

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Estatísticas de leitura do usuário
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *         userIdAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas calculadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalBooks:
 *                   type: number
 *                 booksRead:
 *                   type: number
 *                 booksReading:
 *                   type: number
 *                 booksWantToRead:
 *                   type: number
 *                 averageRating:
 *                   type: number
 *                 topGenres:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       genre:
 *                         type: string
 *                       count:
 *                         type: number
 *                 monthlyReads:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                       count:
 *                         type: number
 *                 totalRereads:
 *                   type: number
 *       401:
 *         description: Token inválido ou ausente
 */
router.get("/", async (req, res) => {
  try {
    const books = await Book.find({ userId: req.userId });

    const booksRead = books.filter((b) => b.status === "lido");
    const booksReading = books.filter((b) => b.status === "lendo");
    const booksWantToRead = books.filter((b) => b.status === "quero_ler");

    // Nota média (só livros com rating)
    const rated = books.filter((b) => b.rating != null);
    const averageRating =
      rated.length > 0
        ? Math.round((rated.reduce((sum, b) => sum + b.rating, 0) / rated.length) * 10) / 10
        : 0;

    // Top gêneros (livros lidos, agrupados por gênero)
    const genreCounts = {};
    for (const book of booksRead) {
      const genre = book.genre || "Sem gênero";
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    }
    const topGenres = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count);

    // Leituras por mês (livros lidos, agrupados por mês do createdAt)
    const monthCounts = {};
    for (const book of booksRead) {
      const date = new Date(book.createdAt);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    }
    const monthlyReads = Object.entries(monthCounts)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Releituras
    const totalRereads = books.filter((b) => b.isReread).length;

    res.json({
      totalBooks: books.length,
      booksRead: booksRead.length,
      booksReading: booksReading.length,
      booksWantToRead: booksWantToRead.length,
      averageRating,
      topGenres,
      monthlyReads,
      totalRereads,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
