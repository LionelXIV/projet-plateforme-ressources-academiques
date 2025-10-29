import { useState } from "react";
import { Upload, X, FileText, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Course, Document } from "../types";
import { apiFetch } from "../lib/api";

interface AddCourseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCourse: (course: Course) => void;
  nextId: number;
}

export default function AddCourseDialog({ isOpen, onClose, onAddCourse, nextId }: AddCourseDialogProps) {
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    fullDescription: "",
    instructor: "",
    category: "",
    level: "",
    image: "",
  });

  const [newDocuments, setNewDocuments] = useState<Document[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<"url" | "upload">("url");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get file type from extension
  const getFileType = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    const typeMap: { [key: string]: string } = {
      'pdf': 'PDF',
      'png': 'Image',
      'jpg': 'Image',
      'jpeg': 'Image',
      'gif': 'Image',
      'svg': 'Image',
      'webp': 'Image',
      'mp4': 'Vidéo',
      'mov': 'Vidéo',
      'avi': 'Vidéo',
      'webm': 'Vidéo',
      'zip': 'ZIP',
      'rar': 'ZIP',
      '7z': 'ZIP',
      'doc': 'DOCX',
      'docx': 'DOCX',
      'xls': 'XLSX',
      'xlsx': 'XLSX',
      'ppt': 'PPTX',
      'pptx': 'PPTX',
      'fig': 'FIG',
    };
    return typeMap[extension] || 'Fichier';
  };

  // Get file size
  const getFileSize = (file: File): string => {
    const bytes = file.size;
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Process files
  const processFiles = (files: File[]) => {
    files.forEach((file) => {
      const fileUrl = URL.createObjectURL(file);
      
      const doc: Document = {
        id: newDocuments.length + Date.now() + Math.random(),
        name: file.name,
        type: getFileType(file.name),
        size: getFileSize(file),
        url: fileUrl,
      };
      
      setNewDocuments(prev => [...prev, doc]);
    });
  };

  // Handle file drop
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  // Handle file input
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // Handle image drop
  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      const imageUrl = URL.createObjectURL(imageFile);
      setNewCourse({...newCourse, image: imageUrl});
    }
  };

  // Handle image input
  const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      setNewCourse({...newCourse, image: imageUrl});
    }
  };

  // Handle image drag events
  const handleImageDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(true);
  };

  const handleImageDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
  };

  // Remove document from list
  const handleRemoveDocument = (id: number) => {
    setNewDocuments(newDocuments.filter(doc => doc.id !== id));
  };

  // Update document name
  const handleUpdateDocumentName = (id: number, newName: string) => {
    setNewDocuments(newDocuments.map(doc => 
      doc.id === id ? { ...doc, name: newName } : doc
    ));
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newCourse.title) {
      setError("Le titre est requis.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: newCourse.title,
        description: newCourse.description,
        fullDescription: newCourse.fullDescription,
        instructor: newCourse.instructor,
        category: newCourse.category,
        level: newCourse.level,
        students: Number(newCourse.students) || 0,
        image: imageInputMode === "url" ? newCourse.image : "",
        documents: newDocuments.map(d => ({
          name: d.name,
          type: d.type,
          size: d.size,
          url: d.url || ""
        }))
      };

      const resp = await apiFetch(`courses/creer/`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        setError(body.error || body.detail || "Erreur lors de la création du cours.");
        setSubmitting(false);
        return;
      }

      const created = await resp.json();
      onAddCourse(created as Course);
      setNewCourse({
        title: "",
        description: "",
        fullDescription: "",
        instructor: "",
        category: "",
        level: "",
        image: "",
        students: 0,
      });
      setNewDocuments([]);
      onClose();
    } catch (err) {
      setError("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau cours</DialogTitle>
          <DialogDescription>
            Remplissez les informations du cours et ajoutez des documents
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre du cours *</Label>
              <Input
                id="title"
                placeholder="Ex: Développement Web Avancé"
                value={newCourse.title}
                onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructor">Instructeur *</Label>
              <Input
                id="instructor"
                placeholder="Ex: Marie Dupont"
                value={newCourse.instructor}
                onChange={(e) => setNewCourse({...newCourse, instructor: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description courte *</Label>
              <Input
                id="description"
                placeholder="Description en une ligne"
                value={newCourse.description}
                onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="fullDescription">Description complète *</Label>
              <Textarea
                id="fullDescription"
                placeholder="Description détaillée du cours..."
                value={newCourse.fullDescription}
                onChange={(e) => setNewCourse({...newCourse, fullDescription: e.target.value})}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Catégorie *</Label>
              <Select 
                value={newCourse.category} 
                onValueChange={(value) => setNewCourse({...newCourse, category: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Développement">Développement</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Langues">Langues</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Niveau *</Label>
              <Select 
                value={newCourse.level} 
                onValueChange={(value) => setNewCourse({...newCourse, level: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Débutant">Débutant</SelectItem>
                  <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                  <SelectItem value="Avancé">Avancé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <Label>Image du cours</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={imageInputMode === "url" ? "default" : "outline"}
                    onClick={() => setImageInputMode("url")}
                    className={imageInputMode === "url" ? "bg-blue-600 text-white" : ""}
                  >
                    URL
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={imageInputMode === "upload" ? "default" : "outline"}
                    onClick={() => setImageInputMode("upload")}
                    className={imageInputMode === "upload" ? "bg-blue-600 text-white" : ""}
                  >
                    Uploader
                  </Button>
                </div>
              </div>

              {imageInputMode === "url" ? (
                <Input
                  id="image"
                  type="url"
                  placeholder="https://..."
                  value={newCourse.image}
                  onChange={(e) => setNewCourse({...newCourse, image: e.target.value})}
                />
              ) : (
                <div
                  onDrop={handleImageDrop}
                  onDragOver={handleImageDragOver}
                  onDragLeave={handleImageDragLeave}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDraggingImage 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-300 bg-slate-50 hover:border-blue-400'
                  }`}
                >
                  <input
                    type="file"
                    id="imageInput"
                    accept="image/*"
                    onChange={handleImageInput}
                    className="hidden"
                  />
                  <label htmlFor="imageInput" className="cursor-pointer">
                    <Upload className={`w-8 h-8 mx-auto mb-2 ${isDraggingImage ? 'text-blue-500' : 'text-slate-400'}`} />
                    <p className="text-sm text-slate-700">
                      Glissez une image ici
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      ou <span className="text-blue-600 hover:underline">parcourez</span>
                    </p>
                  </label>
                </div>
              )}

              {/* Image Preview */}
              {newCourse.image && (
                <div className="mt-3 relative">
                  <img
                    src={newCourse.image}
                    alt="Aperçu"
                    className="w-full h-48 object-cover rounded-lg border border-slate-200"
                    onError={() => setNewCourse({...newCourse, image: ""})}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => setNewCourse({...newCourse, image: ""})}
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Documents Section */}
          <div className="space-y-4 border-t pt-4 mt-4">
            <Label>Documents du cours</Label>
            
            {/* Drag and Drop Zone */}
            <div
              onDrop={handleFileDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-slate-300 bg-slate-50 hover:border-blue-400'
              }`}
            >
              <input
                type="file"
                id="fileInput"
                multiple
                onChange={handleFileInput}
                className="hidden"
              />
              <label htmlFor="fileInput" className="cursor-pointer">
                <Upload className={`w-12 h-12 mx-auto mb-3 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
                <p className="text-slate-700 mb-1">
                  Glissez-déposez vos fichiers ici
                </p>
                <p className="text-sm text-slate-500">
                  ou <span className="text-blue-600 hover:underline">parcourez</span> votre ordinateur
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  PDF, Images, Vidéos, ZIP, DOCX, XLSX supportés
                </p>
              </label>
            </div>
            
            {/* Current documents list */}
            {newDocuments.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-slate-600">{newDocuments.length} fichier{newDocuments.length > 1 ? 's' : ''} ajouté{newDocuments.length > 1 ? 's' : ''}</p>
                {newDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Input
                        value={doc.name}
                        onChange={(e) => handleUpdateDocumentName(doc.id, e.target.value)}
                        className="text-sm h-8 border-0 bg-transparent hover:bg-slate-50 focus:bg-white focus:border-slate-200"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        {doc.type} • {doc.size}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveDocument(doc.id)}
                      className="flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

            {error && (
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={handleCancel}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={submitting}
            >
              {submitting ? "En cours..." : "Ajouter le cours"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
