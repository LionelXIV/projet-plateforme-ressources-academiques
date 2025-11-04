import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Course, Document } from "./types";
import Header from "./components/Header";
import SearchFilters from "./components/SearchFilters";
import CourseCard from "./components/CourseCard";
import CourseDetail from "./components/CourseDetail";
import DocumentViewer from "./components/DocumentViewer";
import AddCourseDialog from "./components/AddCourseDialog";
import AboutSection from "./components/AboutSection";
import Footer from "./components/Footer";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./components/ui/pagination";
import { apiFetch } from "./lib/api"

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 9;
  const [showAddCourseDialog, setShowAddCourseDialog] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [viewerDocument, setViewerDocument] = useState<Document | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    setIsLoggedIn(Boolean(token));
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const base = import.meta.env.VITE_API_URL;
        const resp = await fetch(`${base}/courses`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!resp.ok) {
          console.error("fetch courses failed", resp.status);
          return;
        }
        const data = await resp.json();
        if (!mounted) return;
        const list = Array.isArray(data) ? data : (Array.isArray(data.results) ? data.results : []);
        setCourses(list);
      } catch (e) {
        console.error("error loading courses", e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      const base = import.meta.env.VITE_API_URL_LOGIN;
      await apiFetch(`${base}auth/logout/`, { method: "POST" });
    } catch (e) {
    } finally {
      localStorage.removeItem("jwt_token");
      setIsLoggedIn(false);
      window.location.href = "/";
    }
  };

  const handleViewCourseDetail = async (course: Course) => {
     if (!course?.id) {
       console.error("course id missing", course);
       return;
     }
     try {
       const base = import.meta.env.VITE_API_URL;
       const resp = await fetch(`${base}/courses/${course?.id}/`, { method: "GET" });
      if (!resp.ok) {
        console.error("failed to load course detail", resp.status);
        setSelectedCourse(course);
        return;
      }
      const data = await resp.json();
      setSelectedCourse(data);
     } catch (e) {
       console.error("error fetching course detail", e);
       setSelectedCourse(course);
     }
   };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
  };

  const handleViewDocument = (doc: Document) => {
    setViewerDocument(doc);
    setShowViewer(true);
  };

  const handleAddCourse = (course: Course) => {
    setCourses([course, ...courses]);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setLevelFilter("all");
  };

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
    const matchesLevel = levelFilter === "all" || course.level === levelFilter;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, levelFilter]);

  // Get unique categories and levels
  const categories = Array.from(new Set(courses.map(c => c.category)));
  const levels = Array.from(new Set(courses.map(c => c.level)));

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handleCourseDeleted = (id: number) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    setSelectedCourse(null);
  };

  const handleCourseUpdated = (updated: Course) => {
    setCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
    setSelectedCourse(updated);
  };

  // If a course is selected, show detail view
  if (selectedCourse) {
    const selectedId = Number((selectedCourse as any)?.id ?? (selectedCourse as any)?.pk ?? 0);
    return (
      <>
        <CourseDetail
          courseId={selectedId}
          initial={selectedCourse}
          onClose={handleBackToCourses}
          onViewDocument={handleViewDocument}
          isLoggedIn={isLoggedIn}
          onDelete={handleCourseDeleted}
          onUpdate={handleCourseUpdated}
        />
        <DocumentViewer
          document={viewerDocument}
          isOpen={showViewer}
          onClose={() => setShowViewer(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <Header
        isLoggedIn={isLoggedIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* About Section */}
        <AboutSection />

        {/* Search and Filters */}
        <div className="mb-8">
          <SearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            levelFilter={levelFilter}
            onLevelChange={setLevelFilter}
            categories={categories}
            levels={levels}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Add Course Button (Admin Only) */}
        {isLoggedIn && (
          <div className="mb-6">
            <button
              onClick={() => setShowAddCourseDialog(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Ajouter un nouveau cours
            </button>
          </div>
        )}

        {/* Courses Grid */}
        <div className="mb-6">
          <h2 className="text-2xl mb-4">
            {filteredCourses.length} cours disponible{filteredCourses.length > 1 ? 's' : ''}
            {totalPages > 1 && (
              <span className="text-slate-500 text-base ml-2">
                (Page {currentPage} sur {totalPages})
              </span>
            )}
          </h2>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">
              Aucun cours ne correspond à vos critères de recherche
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onViewDetails={handleViewCourseDetail}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 mb-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer hover:bg-blue-50"
                        }
                      />
                    </PaginationItem>

                    {getPageNumbers().map((page, index) => (
                      <PaginationItem key={index}>
                        {page === "ellipsis" ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            onClick={() => setCurrentPage(page as number)}
                            isActive={currentPage === page}
                            className={
                              currentPage === page
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "cursor-pointer hover:bg-blue-50"
                            }
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer hover:bg-blue-50"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Dialogs */}
      <AddCourseDialog
        isOpen={showAddCourseDialog}
        onClose={() => setShowAddCourseDialog(false)}
        onAddCourse={handleAddCourse}
        nextId={courses.length + 1}
      />
    </div>
  );
}
