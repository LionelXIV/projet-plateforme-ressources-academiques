import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Document } from "../types";

interface DocumentViewerProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DocumentViewer({ document, isOpen, onClose }: DocumentViewerProps) {
  const [viewerError, setViewerError] = useState("");

  if (!document) return null;

  const renderDocumentContent = () => {
    if (!document.url) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ce document n'a pas d'URL valide pour la prévisualisation.
          </AlertDescription>
        </Alert>
      );
    }

    if (viewerError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{viewerError}</AlertDescription>
        </Alert>
      );
    }

    switch (document.type) {
      case "PDF":
        return (
          <iframe
            src={document.url}
            className="w-full h-[600px] border-0 rounded-lg"
            title={document.name}
            onError={() => setViewerError("Impossible de charger le PDF. Le lien peut être invalide ou le fichier protégé.")}
          />
        );

      case "Image":
        return (
          <div className="flex items-center justify-center bg-slate-100 rounded-lg p-4">
            <img
              src={document.url}
              alt={document.name}
              className="max-w-full max-h-[600px] object-contain rounded-lg"
              onError={() => setViewerError("Impossible de charger l'image. Le lien peut être invalide.")}
            />
          </div>
        );

      case "Vidéo":
        return (
          <video
            src={document.url}
            controls
            className="w-full max-h-[600px] rounded-lg bg-black"
            onError={() => setViewerError("Impossible de lire la vidéo. Le format peut ne pas être supporté.")}
          >
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
        );

      case "ZIP":
      case "DOCX":
      case "XLSX":
      case "PPTX":
      case "FIG":
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Ce type de fichier ({document.type}) ne peut pas être prévisualisé. Veuillez le télécharger pour l'ouvrir.
            </AlertDescription>
          </Alert>
        );

      default:
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Type de fichier non supporté pour la prévisualisation.
            </AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg">{document.name}</h3>
            <p className="text-sm text-slate-500">
              {document.type} • {document.size}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {renderDocumentContent()}
        
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
