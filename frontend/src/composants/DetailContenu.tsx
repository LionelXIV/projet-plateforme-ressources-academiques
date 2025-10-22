import { Download, BookOpen } from "lucide-react";

interface ContentCardProps {
  title: string;
  description: string;
  tags: string[];
}

export default function ContentCard({ title, description, tags }: ContentCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-all">
      {/* Partie gauche : texte */}
      <div className="flex items-start gap-3">
        <BookOpen className="text-indigo-600 w-6 h-6 mt-1 flex-shrink-0" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
          <div className="flex flex-wrap mt-2 gap-2">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="text-xs bg-indigo-50 text-indigo-700 font-medium px-2 py-1 rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bouton de droite */}
      <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all text-sm shadow-sm">
        <Download className="w-4 h-4" />
        Télécharger
      </button>
    </div>
  );
}
