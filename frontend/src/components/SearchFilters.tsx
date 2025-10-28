import { Search, RotateCcw } from "lucide-react";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  levelFilter: string;
  onLevelChange: (value: string) => void;
  categories: string[];
  levels: string[];
  onResetFilters: () => void;
}

export default function SearchFilters({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  levelFilter,
  onLevelChange,
  categories,
  levels,
  onResetFilters,
}: SearchFiltersProps) {
  const hasActiveFilters = searchQuery !== "" || categoryFilter !== "all" || levelFilter !== "all";

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Bar */}
        <div className="md:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher un cours, un instructeur..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="md:col-span-1">
          <Select value={categoryFilter} onValueChange={onCategoryChange}>
            <SelectTrigger className="border-slate-200 rounded-xl">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Level Filter */}
        <div className="md:col-span-1">
          <Select value={levelFilter} onValueChange={onLevelChange}>
            <SelectTrigger className="border-slate-200 rounded-xl">
              <SelectValue placeholder="Niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les niveaux</SelectItem>
              {levels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reset Button */}
        <div className="md:col-span-1 flex items-center">
          <Button
            onClick={onResetFilters}
            variant="outline"
            className={`w-full border-slate-200 rounded-xl transition-all ${
              hasActiveFilters
                ? "bg-blue-50 text-blue-600 border-blue-300 hover:bg-blue-100"
                : "text-slate-400"
            }`}
            disabled={!hasActiveFilters}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Réinitialiser les filtres
          </Button>
        </div>
      </div>
    </div>
  );
}
