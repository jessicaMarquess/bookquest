import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  if (apiKey) {
    if (apiKey !== process.env.API_KEY) {
      return res.status(401).json({ error: "API key inválida" });
    }
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(400).json({ error: "x-user-id é obrigatório com x-api-key" });
    }
    req.userId = userId;
    return next();
  }

  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  try {
    const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
}
