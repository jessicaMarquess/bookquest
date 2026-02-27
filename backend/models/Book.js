import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  status: {
    type: String,
    enum: ["quero_ler", "lendo", "lido"],
    default: "quero_ler",
  },
  rating: { type: Number, min: 0, max: 10, default: null },
  genre: { type: String, default: "" },
  isReread: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Book", bookSchema);
