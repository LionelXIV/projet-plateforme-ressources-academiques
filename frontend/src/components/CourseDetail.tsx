import { ArrowLeft, Users, FileText, Eye, Download } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Course, Document } from "../types";

interface CourseDetailProps {
  course: Course;
  onBack: () => void;
  onViewDocument: (doc: Document) => void;
}

export default function CourseDetail({ course, onBack, onViewDocument }: CourseDetailProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          onClick={onBack}
          variant="outline"
          className="mb-6 border-blue-200 hover:bg-blue-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux cours
        </Button>

        {/* Course Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="relative h-96 bg-gradient-to-br from-blue-100 to-slate-100">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-blue-600 text-white border-0">
                  {course.level}
                </Badge>
                <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                  {course.category}
                </Badge>
              </div>
              <h1 className="text-4xl mb-3">{course.title}</h1>
              <p className="text-xl text-blue-100 mb-4">{course.description}</p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Avatar className="w-10 h-10 border-2 border-white">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {course.instructor.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span>{course.instructor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{course.students.toLocaleString()} étudiants</span>
                </div>
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="p-8">
            <h2 className="text-2xl mb-4">Description complète</h2>
            <p className="text-slate-700 leading-relaxed mb-6">
              {course.fullDescription}
            </p>

            {/* Documents Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl">Documents et ressources</h2>
                <Badge variant="outline" className="text-blue-600">
                  {course.documents.length} document{course.documents.length > 1 ? 's' : ''}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.documents.map((doc) => (
                  <Card key={doc.id} className="hover:shadow-lg transition-shadow border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="truncate mb-1">{doc.name}</h3>
                          <p className="text-sm text-slate-500">
                            {doc.type} • {doc.size}
                          </p>
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onViewDocument(doc)}
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
                              <a href={doc.url} download={doc.name}>
                                <Download className="w-4 h-4 mr-1" />
                                Télécharger
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
