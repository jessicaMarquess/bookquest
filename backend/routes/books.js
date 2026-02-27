import { Router } from "express";
import auth from "../middleware/auth.js";
import Book from "../models/Book.js";
import User from "../models/User.js";

const router = Router();

router.use(auth);

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Listar todos os livros do usuário
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *         userIdAuth: []
 *     responses:
 *       200:
 *         description: Lista de livros
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       401:
 *         description: Token inválido ou ausente
 */
router.get("/", async (req, res) => {
  const books = await Book.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(books);
});

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Adicionar novo livro
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *         userIdAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, author]
 *             properties:
 *               title:
 *                 type: string
 *                 example: O Senhor dos Anéis
 *               author:
 *                 type: string
 *                 example: J.R.R. Tolkien
 *               status:
 *                 type: string
 *                 enum: [quero_ler, lendo, lido]
 *                 default: quero_ler
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 10
 *                 example: 9
 *               genre:
 *                 type: string
 *                 example: Fantasia
 *               isReread:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Livro criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       401:
 *         description: Token inválido ou ausente
 */
router.post("/", async (req, res) => {
  try {
    const { title, author, status, rating, genre, isReread } = req.body;
    const book = await Book.create({ title, author, status, rating, genre, isReread, userId: req.userId });

    if (status === "lido") {
      await User.findByIdAndUpdate(req.userId, {
        $inc: { xp: 100 },
      });
      await recalcLevel(req.userId);
    }

    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Atualizar livro
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *         userIdAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do livro
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [quero_ler, lendo, lido]
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 10
 *               genre:
 *                 type: string
 *               isReread:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Livro atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Livro não encontrado
 *       401:
 *         description: Token inválido ou ausente
 */
router.put("/:id", async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, userId: req.userId });
    if (!book) return res.status(404).json({ error: "Livro não encontrado" });

    const oldStatus = book.status;
    const newStatus = req.body.status || oldStatus;

    book.title = req.body.title || book.title;
    book.author = req.body.author || book.author;
    book.status = newStatus;
    if (req.body.rating !== undefined) book.rating = req.body.rating;
    if (req.body.genre !== undefined) book.genre = req.body.genre;
    if (req.body.isReread !== undefined) book.isReread = req.body.isReread;
    await book.save();

    if (oldStatus !== "lido" && newStatus === "lido") {
      await User.findByIdAndUpdate(req.userId, { $inc: { xp: 100 } });
      await recalcLevel(req.userId);
    } else if (oldStatus === "lido" && newStatus !== "lido") {
      await User.findByIdAndUpdate(req.userId, { $inc: { xp: -100 } });
      await recalcLevel(req.userId);
    }

    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Deletar livro
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *         userIdAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do livro
 *     responses:
 *       200:
 *         description: Livro deletado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *       404:
 *         description: Livro não encontrado
 *       401:
 *         description: Token inválido ou ausente
 */
router.delete("/:id", async (req, res) => {
  try {
    const book = await Book.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!book) return res.status(404).json({ error: "Livro não encontrado" });

    if (book.status === "lido") {
      await User.findByIdAndUpdate(req.userId, { $inc: { xp: -100 } });
      await recalcLevel(req.userId);
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function recalcLevel(userId) {
  const user = await User.findById(userId);
  // Progressão crescente: nível N exige N*100 XP acumulado para subir
  // Nível 1: 0 XP, Nível 2: 100 XP, Nível 3: 300 XP, Nível 4: 600 XP...
  // Fórmula inversa: level = floor((1 + sqrt(1 + 8*xp/100)) / 2)
  user.level = Math.floor((1 + Math.sqrt(1 + (8 * user.xp) / 100)) / 2);
  await user.save();
}

export default router;
