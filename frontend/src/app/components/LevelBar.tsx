interface Profile {
  level: number;
  xp: number;
  xpProgress: number;
  xpToNext: number;
  booksRead: number;
  booksReading: number;
}

export default function LevelBar({ profile }: { profile: Profile }) {
  const progress = profile.xpProgress;

  return (
    <div className="bg-gray-900 rounded-2xl p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold font-mono">Nível {profile.level}</p>
          <p className="text-gray-400 text-sm">{profile.xp} XP total</p>
        </div>
        <div className="text-right text-sm text-gray-400">
          <p>{profile.booksRead} livros lidos</p>
          <p>{profile.booksReading} lendo</p>
        </div>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-3">
        <div
          className="bg-pink-400 h-3 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">
        {profile.xpToNext} XP para o próximo nível
      </p>
    </div>
  );
}
