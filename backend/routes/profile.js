import { Router } from "express";
import auth from "../middleware/auth.js";
import User from "../models/User.js";
import Book from "../models/Book.js";

const router = Router();

router.use(auth);

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Obter perfil do usuário
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *         userIdAuth: []
 *     responses:
 *       200:
 *         description: Dados do perfil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 xp:
 *                   type: number
 *                 level:
 *                   type: number
 *                 xpToNext:
 *                   type: number
 *                   description: XP restante para o próximo nível
 *                 xpProgress:
 *                   type: number
 *                   description: Progresso em porcentagem (0-100)
 *                 totalBooks:
 *                   type: number
 *                 booksRead:
 *                   type: number
 *                 booksReading:
 *                   type: number
 *       401:
 *         description: Token inválido ou ausente
 */
router.get("/", async (req, res) => {
  const user = await User.findById(req.userId).select("-password");
  const totalBooks = await Book.countDocuments({ userId: req.userId });
  const booksRead = await Book.countDocuments({ userId: req.userId, status: "lido" });
  const booksReading = await Book.countDocuments({ userId: req.userId, status: "lendo" });

  // Calcula tudo direto do XP, sem depender do level salvo no banco
  const xp = user.xp;
  const level = Math.floor((1 + Math.sqrt(1 + (8 * xp) / 100)) / 2);
  const xpForCurrentLevel = ((level - 1) * level / 2) * 100;
  const xpForNextLevel = (level * (level + 1) / 2) * 100;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const xpInLevel = xp - xpForCurrentLevel;

  // Atualiza level no banco se necessário
  if (user.level !== level) {
    await User.findByIdAndUpdate(req.userId, { level });
  }

  res.json({
    name: user.name,
    email: user.email,
    xp,
    level,
    xpToNext: xpNeeded - xpInLevel,
    xpProgress: Math.round((xpInLevel / xpNeeded) * 100),
    totalBooks,
    booksRead,
    booksReading,
  });
});

export default router;
