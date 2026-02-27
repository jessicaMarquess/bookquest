import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BookQuest API",
      version: "1.0.0",
      description: "API do BookQuest — gerencie sua estante de livros com gamificação",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Servidor local",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        apiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
          description: "Chave estática da API (definida no .env)",
        },
        userIdAuth: {
          type: "apiKey",
          in: "header",
          name: "x-user-id",
          description: "ID do usuário (obrigatório junto com x-api-key)",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            xp: { type: "number" },
            level: { type: "number" },
          },
        },
        Book: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            author: { type: "string" },
            status: { type: "string", enum: ["quero_ler", "lendo", "lido"] },
            rating: { type: "number", minimum: 0, maximum: 10, nullable: true },
            genre: { type: "string" },
            isReread: { type: "boolean" },
            userId: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
