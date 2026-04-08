export const GENRE_OPTIONS = [
  "Romance",
  "Fantasia",
  "Ficção Científica",
  "Terror",
  "Suspense / Thriller",
  "Mistério / Policial",
  "Aventura",
  "Drama",
  "Biografia / Autobiografia",
  "História",
  "Ciência",
  "Filosofia",
  "Psicologia",
  "Autoajuda",
  "Negócios / Finanças",
  "Tecnologia",
  "Saúde / Bem-estar",
  "Poesia",
  "Quadrinhos / Graphic Novel",
  "Infantil",
  "Juvenil",
  "Clássico",
  "Outro",
];

export const STATUS_LABELS: Record<string, string> = {
  quero_ler: "Quero Ler",
  lido: "Lido",
  lendo: "Lendo",
};

export enum status {
  QUERO_LER = "quero_ler",
  LIDO = "lido",
  LENDO = "lendo",
  TODOS = "todos",
}
