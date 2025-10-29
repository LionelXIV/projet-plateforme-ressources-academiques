import { useEffect, useState } from "react";
import { ArrowLeft, Users, FileText, Eye, Download, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Course } from "../types";
import { getCourse, deleteCourse } from "../lib/api";

interface CourseDetailProps {
  courseId: number;
  initial?: Course | null;
  onClose?: () => void;
  onViewDocument?: (doc: any) => void;
  isLoggedIn?: boolean;
  onDelete?: (id: number) => void;
}

export default function CourseDetail({ courseId, initial = null, onClose, onViewDocument, isLoggedIn = false, onDelete }: CourseDetailProps) {
  const [course, setCourse] = useState<Course | null>(initial);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (initial) {
      setCourse(initial);
      setLoading(false);
      return;
    }

    setLoading(true);
    getCourse(Number(courseId))
      .then((data) => {
        if (!mounted) return;
        setCourse(data);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || "Erreur lors du chargement du cours");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [courseId, initial]);

  const handleDeleteClick = async () => {
    if (!course?.id) return;
    if (!confirm("Supprimer définitivement ce cours ? Cette opération est irréversible.")) return;
    setDeleting(true);
    try {
      await deleteCourse(course.id);
      if (onDelete) onDelete(course.id);
      else if (onClose) onClose();
    } catch (e: any) {
      setError(e?.message || "Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="text-red-600">Erreur: {error}</div>;
  if (!course) return <div>Cours introuvable</div>;

  const handleViewDocument = (doc: any) => {
    if (onViewDocument) return onViewDocument(doc);
    if (doc?.url) window.open(doc.url, "_blank", "noopener");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button + optional delete */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button
              onClick={onClose}
              variant="outline"
              className="mb-6 border-blue-200 hover:bg-blue-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux cours
            </Button>
          </div>

          {isLoggedIn && (
            <div>
              <Button
                onClick={handleDeleteClick}
                variant="destructive"
                className="flex items-center gap-2"
                disabled={deleting}
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? "Suppression..." : "Supprimer le cours"}
              </Button>
            </div>
          )}
        </div>

        {/* Course Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="relative h-96 bg-gradient-to-br from-blue-100 to-slate-100">
            <img
              src={course.image || "/placeholder-course.jpg"}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-blue-600 text-white border-0">
                  {course.level || "—"}
                </Badge>
                <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                  {course.category || "—"}
                </Badge>
              </div>
              <h1 className="text-4xl mb-3">{course.title}</h1>
              <p className="text-xl text-blue-100 mb-4">{course.description}</p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Avatar className="w-10 h-10 border-2 border-white">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {(course.instructor || " ").split(' ').map(n => n?.[0] || '').join('').slice(0,3)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{course.instructor || "Instructeur inconnu"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{(course.students ?? 0).toLocaleString()} étudiants</span>
                </div>
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="p-8">
            <h2 className="text-2xl mb-4">Description complète</h2>
            <p className="text-slate-700 leading-relaxed mb-6">
              {course.fullDescription || "Pas de description fournie."}
            </p>

            {/* Documents Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl">Documents et ressources</h2>
                <Badge variant="outline" className="text-blue-600">
                  {Array.isArray(course.documents) ? course.documents.length : 0} document{(Array.isArray(course.documents) && course.documents.length > 1) ? 's' : ''}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.isArray(course.documents) && course.documents.length > 0 ? (
                  course.documents.map((doc) => (
                    <Card key={doc.id} className="hover:shadow-lg transition-shadow border-slate-200">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <FileText className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="truncate mb-1">{doc.name}</h3>
                            <p className="text-sm text-slate-500">
                              {doc.type || "—"} • {doc.size || "—"}
                            </p>
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDocument(doc)}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Voir
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                              >
                                <a href={doc.url || '#'} download={doc.name}>
                                  <Download className="w-4 h-4 mr-1" />
                                  Télécharger
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p>Aucun document</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
