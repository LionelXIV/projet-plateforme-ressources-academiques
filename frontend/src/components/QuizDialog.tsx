import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";

interface QuizDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuizDialog({ isOpen, onClose }: QuizDialogProps) {
  const predefinedThemes = ["Histoire", "Maths", "Science", "Géographie"];

  const [theme, setTheme] = useState(""); 
  const [useCustomTheme, setUseCustomTheme] = useState(false);
  const [customTheme, setCustomTheme] = useState("");
  const [quizData, setQuizData] = useState<any[]>([]); 
  const [loading, setLoading] = useState(false);

  const handleGenerateQuiz = async () => {
    const selectedTheme = useCustomTheme ? customTheme : theme;
    if (!selectedTheme) {
      alert("Veuillez choisir ou entrer un thème.");
      return;
    }

    setLoading(true);
    setQuizData([]);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/quizzes/generate-quiz/?theme=${encodeURIComponent(selectedTheme)}`
      );
      if (!response.ok) throw new Error("Erreur API");
      const data = await response.json();
      setQuizData(data);
    } catch (error) {
      console.error("Erreur lors de la génération du quiz :", error);
      alert("Impossible de générer le quiz. Vérifiez la console pour plus d'infos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-[90vh] p-4 flex flex-col">
        {/* Header fixe */}
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Choisir un thème pour le quiz</DialogTitle>
          <DialogDescription>
            Sélectionnez un thème ou entrez un thème personnalisé
          </DialogDescription>
        </DialogHeader>

        {/* Contenu SCROLLABLE - CORRIGÉ */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Select thème prédéfini */}
          <select
            className="w-full border border-blue-300 rounded-xl px-3 py-2 bg-blue-50 text-blue-700"
            value={useCustomTheme ? "Autre" : theme}
            onChange={(e) => {
              if (e.target.value === "Autre") {
                setUseCustomTheme(true);
                setTheme("");
              } else {
                setUseCustomTheme(false);
                setTheme(e.target.value);
              }
            }}
          >
            <option value="">Sélectionner un thème</option>
            {predefinedThemes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
            <option value="Autre">Autre...</option>
          </select>

          {useCustomTheme && (
            <input
              type="text"
              placeholder="Entrez votre thème"
              className="w-full border border-blue-300 rounded-xl px-3 py-2 bg-blue-50 text-blue-700"
              value={customTheme}
              onChange={(e) => setCustomTheme(e.target.value)}
            />
          )}

          {/* Quiz - avec scroll interne */}
          {quizData.length > 0 && (
            <div className="p-4 border border-blue-200 rounded-xl bg-blue-50 overflow-y-auto max-h-[60vh]">
              {quizData.map((q: any, index: number) => {
                const match = q.question.match(
                  /A:\s*(.*),\s*B:\s*(.*),\s*C:\s*(.*),\s*D:\s*(.*)/
                );
                return (
                  <div key={index} className="mb-6 p-3 border-b border-blue-200 last:border-0">
                    <p className="font-semibold mb-2">
                      {index + 1}. {q.question.split("A:")[0].trim()}?
                    </p>
                    <ul className="list-none ml-2 space-y-1">
                      {match &&
                        ["A", "B", "C", "D"].map((opt, i) => (
                          <li key={opt} className="flex items-start">
                            <strong className="mr-2">{opt}:</strong>
                            <span>{match[i + 1]}</span>
                          </li>
                        ))}
                    </ul>
                    <p className="mt-2 text-green-700 font-medium">
                      Réponse : {q.answer}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bouton Générer fixé en bas */}
        <div className="flex-shrink-0 pt-4 flex justify-center border-t border-gray-200">
          <Button
            onClick={handleGenerateQuiz}
            disabled={loading}
            className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 px-6 py-3 rounded-xl shadow-md hover:shadow-lg hover:from-blue-200 hover:to-blue-300 transition-all flex items-center gap-2"
          >
            {loading ? "Génération..." : "Générer le quiz"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}