import { useEffect, useState } from "react";
import { ArrowLeft, Users, FileText, Eye, Download, Trash2, Edit } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Course } from "../types";
import { getCourse, deleteCourse, apiFetch } from "../lib/api";

interface CourseDetailProps {
  courseId: number;
  initial?: Course | null;
  onClose?: () => void;
  onViewDocument?: (doc: any) => void;
  isLoggedIn?: boolean;
  onDelete?: (id: number) => void;
  onUpdate?: (course: Course) => void;
  currentUser?: string | null;
  isAdmin?: boolean;
}

export default function CourseDetail({ courseId, initial = null, onClose, onViewDocument, isLoggedIn = false, onDelete, onUpdate, currentUser = null, isAdmin = false }: CourseDetailProps) {
  const [course, setCourse] = useState<Course | null>(initial);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    fullDescription: "",
    instructor: "",
    category: "",
    level: "",
    image: ""
  });
  const [saving, setSaving] = useState(false);

  const resolvedUser = currentUser ?? localStorage.getItem("jwt_username") ?? null;
  const resolvedIsAdmin = isAdmin || (localStorage.getItem("jwt_is_admin") === "1");

  useEffect(() => {
    let mounted = true;
    if (initial) {
      setCourse(initial);
      setForm({
        title: initial.title || "",
        description: initial.description || "",
        fullDescription: initial.fullDescription || "",
        instructor: initial.instructor || "",
        category: initial.category || "",
        level: initial.level || "",
        image: initial.image || ""
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    getCourse(Number(courseId))
      .then((data) => {
        if (!mounted) return;
        setCourse(data);
        setForm({
          title: data.title || "",
          description: data.description || "",
          fullDescription: data.fullDescription || "",
          instructor: data.instructor || "",
          category: data.category || "",
          level: data.level || "",
          image: data.image || ""
        });
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

  const startEdit = () => {
    if (!course) return;
    setForm({
      title: course.title || "",
      description: course.description || "",
      fullDescription: course.fullDescription || "",
      instructor: course.instructor || "",
      category: course.category || "",
      level: course.level || "",
      image: course.image || ""
    });
    setEditing(true);
  };

  const handleSave = async () => {
    if (!course?.id) return;
    setSaving(true);
    setError(null);
    const payload: any = {
      title: form.title,
      description: form.description,
      fullDescription: form.fullDescription,
      instructor: form.instructor,
      category: form.category,
      level: form.level,
      image: form.image,
    };
    try {
      const resp = await apiFetch(`/courses/${course?.id}/`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        console.error('[CourseDetail] save failed body=', body);
        throw new Error(body.error || body.detail || `HTTP ${resp.status}`);
      }
      const updated = await resp.json();
      setCourse(updated);
      setEditing(false);
      if (onUpdate) onUpdate(updated);
    } catch (e: any) {
      console.error('[CourseDetail] save error', e);
      setError(e?.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="text-red-600">Erreur: {error}</div>;
  if (!course) return <div>Cours introuvable</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back + optional actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button onClick={onClose} variant="outline" className="mb-6 border-blue-200 hover:bg-blue-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux cours
            </Button>
          </div>

            <div className="flex items-center gap-2">
              {isLoggedIn && (resolvedIsAdmin || !course?.author || course?.author === resolvedUser) && (
                <>
                  <Button onClick={startEdit} variant="outline" className="flex items-center gap-2">
                    <Edit className="w-4 h-4" /> Modifier
                  </Button>
                  <Button onClick={handleDeleteClick} variant="destructive" className="flex items-center gap-2" disabled={deleting}>
                    <Trash2 className="w-4 h-4" /> {deleting ? "Suppression..." : "Supprimer le cours"}
                  </Button>
                </>
              )}
            </div>
        </div>

        {/* If editing, show simple form */}
        {editing ? (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="p-2 border rounded" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
              <input className="p-2 border rounded" value={form.instructor} onChange={(e) => setForm({...form, instructor: e.target.value})} />
              <input className="p-2 border rounded md:col-span-2" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
              <textarea className="p-2 border rounded md:col-span-2" rows={4} value={form.fullDescription} onChange={(e) => setForm({...form, fullDescription: e.target.value})} />
              <input className="p-2 border rounded" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} />
              <input className="p-2 border rounded" value={form.level} onChange={(e) => setForm({...form, level: e.target.value})} />
              <input className="p-2 border rounded md:col-span-2" value={form.image} onChange={(e) => setForm({...form, image: e.target.value})} placeholder="Image URL" />
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={() => setEditing(false)} variant="outline" disabled={saving}>Annuler</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? "Sauvegarde..." : "Sauvegarder"}</Button>
            </div>
          </div>
        ) : null}

        {/* Existing presentation (keep unchanged) */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="relative h-96 bg-gradient-to-br from-blue-100 to-slate-100">
            <img src={course.image || "/placeholder-course.jpg"} alt={course.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-blue-600 text-white border-0">{course.level || "—"}</Badge>
                <Badge variant="outline" className="bg-white/20 text-white border-white/40">{course.category || "—"}</Badge>
              </div>
              <h1 className="text-4xl mb-3">{course.title}</h1>
              <p className="text-xl text-blue-100 mb-4">{course.description}</p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Avatar className="w-10 h-10 border-2 border-white">
                    <AvatarFallback className="bg-blue-600 text-white">{(course.instructor || " ").split(' ').map(n => n?.[0] || '').join('').slice(0,3)}</AvatarFallback>
                  </Avatar>
                  <span>{course.instructor || "Instructeur inconnu"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="p-8">
            <h2 className="text-2xl mb-4">Description complète</h2>
            <p className="text-slate-700 leading-relaxed mb-6">{course.fullDescription || "Pas de description fournie."}</p>

            {/* Documents Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl">Documents et ressources</h2>
                <Badge variant="outline" className="text-blue-600">{(course.documents || []).length} document(s)</Badge>
              </div>

              {(course.documents || []).length > 0 ? (
                (course.documents || []).map(doc => (
                  <Card key={doc.id} className="mb-4">
                    <CardContent className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{doc.name}</h3>
                            <p className="text-sm text-slate-500">{doc.type || "—"} • {doc.size || "—"}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => { if (onViewDocument) onViewDocument(doc); }}>
                              <Eye className="w-4 h-4 mr-1"/> Voir
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <a href={doc.url || '#'} download={doc.name}><Download className="w-4 h-4 mr-1"/> Télécharger</a>
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
  );
}