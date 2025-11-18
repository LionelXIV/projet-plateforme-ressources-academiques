import { Clock, Users, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Course } from "../types";

interface CourseCardProps {
  course: Course;
  onViewDetails: (course: Course) => void;
}

export default function CourseCard({ course, onViewDetails }: CourseCardProps) {
  return (
    <Card className="hover:shadow-2xl transition-all duration-300 border-slate-200 overflow-hidden group">
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-slate-100">
        <img
  src={
    course.image.startsWith("http") 
      ? course.image 
      : `http://127.0.0.1:8000${course.image}`
  }
  alt={course.title}
  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
/>

        <div className="absolute top-3 right-3">
          <Badge className="bg-blue-600 text-white border-0">
            {course.level}
          </Badge>
        </div>
      </div>
      
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Clock className="w-4 h-4" />
          <span>{course.publishedAt}</span>
        </div>
        <CardTitle className="line-clamp-2 group-hover:text-blue-600 transition-colors">
          {course.title}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {course.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            {course.category}
          </Badge>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <Button
          onClick={() => onViewDetails(course)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white group-hover:shadow-lg transition-all"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Voir les détails
        </Button>
      </CardFooter>
    </Card>
  );
}
