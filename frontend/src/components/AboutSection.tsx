import { TrendingUp, Star, ShieldCheck, Sparkles, BookOpen, Heart } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export default function AboutSection() {
  return (
    <div className="mb-12">
      {/* About Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-blue-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-3xl text-blue-900">À propos de la plateforme</h2>
          </div>
          
          <div className="space-y-4 text-slate-700">
            <p className="text-lg">
              Cette plateforme a été créée par des étudiants du programme d'informatique de l'UQAR 
              (Université du Québec à Rimouski) dans le but de centraliser et partager les ressources 
              académiques de manière collaborative.
            </p>
            <p>
              Notre mission est de faciliter l'accès au savoir et de promouvoir le partage de 
              connaissances entre étudiants, professeurs et passionnés d'apprentissage. Nous croyons 
              fermement que l'éducation devrait être accessible à tous, et c'est pourquoi nous mettons 
              à disposition ces ressources gratuitement.
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl text-blue-900">Notre Vision</h3>
              </div>
              <p className="text-blue-800">
                Créer une communauté d'apprentissage collaborative où chacun peut contribuer, 
                apprendre et grandir ensemble. Nous visons à devenir la référence en matière de 
                partage de ressources académiques au Québec.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-8">
        <h3 className="text-2xl mb-6 text-center text-slate-800">Pourquoi choisir notre plateforme ?</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-blue-100 hover:shadow-lg transition-all hover:border-blue-300">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-7 h-7 text-blue-600" />
              </div>
              <h4 className="mb-2 text-blue-900">Cours de Qualité</h4>
              <p className="text-sm text-slate-600">
                Ressources vérifiées et approuvées par nos enseignants et contributeurs expérimentés
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-100 hover:shadow-lg transition-all hover:border-blue-300">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-7 h-7 text-blue-600" />
              </div>
              <h4 className="mb-2 text-blue-900">Documents Téléchargeables</h4>
              <p className="text-sm text-slate-600">
                Accédez à tous les supports de cours en formats variés (PDF, vidéos, documents)
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-100 hover:shadow-lg transition-all hover:border-blue-300">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-7 h-7 text-blue-600" />
              </div>
              <h4 className="mb-2 text-blue-900">100% Gratuit</h4>
              <p className="text-sm text-slate-600">
                Toutes les ressources sont en libre accès, sans frais ni inscription obligatoire
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-100 hover:shadow-lg transition-all hover:border-blue-300">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-blue-600" />
              </div>
              <h4 className="mb-2 text-blue-900">Toujours à Jour</h4>
              <p className="text-sm text-slate-600">
                Nouveaux cours et ressources ajoutés régulièrement par notre communauté active
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
