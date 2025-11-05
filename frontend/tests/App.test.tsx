import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import App from "../src/App";
import { Course, Document } from "../src/types";
import * as api from "../src/lib/api";

const buildCourse = (id: number, overrides: Partial<Course> = {}): Course => ({
  id,
  title: `Cours ${id}`,
  description: `Description brève du cours ${id}`,
  fullDescription: `Description complète du cours ${id}`,
  instructor: `Professeur ${id}`,
  category: id % 2 === 0 ? "Développement" : "Design",
  level: id % 2 === 0 ? "Intermédiaire" : "Débutant",
  image: `/images/course-${id}.jpg`,
  publishedAt: "2025-01-01",
  documents: [],
  ...overrides,
});

vi.mock("../src/components/Header", () => ({
  default: ({
    isLoggedIn,
    onLogin,
    onLogout,
  }: {
    isLoggedIn: boolean;
    onLogin: () => void;
    onLogout: () => void;
  }) => (
    <header>
      <p>{isLoggedIn ? "Header connecté" : "Header invité"}</p>
      <button onClick={onLogin}>ouvrir-login</button>
      <button onClick={onLogout}>se-déconnecter</button>
    </header>
  ),
}));

vi.mock("../src/components/SearchFilters", () => ({
  default: ({
    searchQuery,
    onSearchChange,
    onResetFilters,
  }: {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onResetFilters: () => void;
  }) => (
    <section>
      <label htmlFor="search-field">Recherche</label>
      <input
        id="search-field"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <button onClick={onResetFilters}>réinitialiser</button>
    </section>
  ),
}));

vi.mock("../src/components/CourseDetail", () => ({
  default: ({
    courseId,
    onClose,
    onViewDocument,
    onDelete,
    onUpdate,
    initial,
  }: {
    courseId: number;
    onClose: () => void;
    onViewDocument: (doc: Document) => void;
    onDelete?: (id: number) => void;
    onUpdate?: (course: Course) => void;
    initial?: Course | null;
  }) => (
    <div>
      <p>Détails du cours {courseId}</p>
      <button onClick={onClose}>fermer-détails</button>
      <button
        onClick={() =>
          onViewDocument({
            id: 77,
            name: "Plan du cours",
            type: "PDF",
            size: "1 Mo",
          })
        }
      >
        ouvrir-document
      </button>
      <button
        onClick={() =>
          onUpdate?.({
            ...(initial || buildCourse(courseId)),
            title: `Cours ${courseId} mis à jour`,
          })
        }
      >
        mettre-à-jour
      </button>
      <button onClick={() => onDelete?.(courseId)}>supprimer-cours</button>
      <button onClick={() => onDelete?.(courseId)}>delete-course</button>
    </div>
  ),
}));

vi.mock("../src/components/DocumentViewer", () => ({
  default: ({
    document,
    isOpen,
    onClose,
  }: {
    document: Document | null;
    isOpen: boolean;
    onClose: () => void;
  }) =>
    isOpen && document ? (
      <div>
        <p>Visionneuse: {document.name}</p>
        <button onClick={onClose}>fermer-visionneuse</button>
      </div>
    ) : null,
}));

vi.mock("../src/components/AddCourseDialog", () => ({
  default: ({
    isOpen,
    onAddCourse,
    onClose,
    nextId,
  }: {
    isOpen: boolean;
    onAddCourse: (course: Course) => void;
    onClose: () => void;
    nextId: number;
  }) =>
    isOpen ? (
      <div>
        <p>Dialogue ajout cours</p>
        <button
          onClick={() => {
            onAddCourse({
              id: nextId,
              title: "Nouveau cours collaboratif",
              description: "Créé via le dialogue",
              fullDescription: "Contenu riche pour les étudiants de l'UQAR.",
              instructor: "Équipe Pédagogique",
              category: "Développement",
              level: "Intermédiaire",
              image: "/images/new-course.png",
              publishedAt: "2025-01-05",
              documents: [],
            });
            onClose();
          }}
        >
          valider-ajout
        </button>
        <button onClick={onClose}>fermer-dialogue</button>
      </div>
    ) : null,
}));

vi.mock("../src/components/AboutSection", () => ({
  default: () => <section>À propos de la plateforme</section>,
}));

vi.mock("../src/components/Footer", () => ({
  default: () => <footer>Pied de page mock</footer>,
}));

const originalLocation = window.location;

beforeAll(() => {
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: { href: "", assign: vi.fn() },
  });
});

afterAll(() => {
  Object.defineProperty(window, "location", {
    configurable: true,
    value: originalLocation,
  });
});

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  window.location.href = "";
});

describe("App", () => {
  test("charge les cours, applique la recherche et gère la pagination", async () => {
    const courses = Array.from({ length: 12 }, (_, index) =>
      buildCourse(index + 1),
    );

    const detailedCourse = buildCourse(1, {
      description: "Version détaillée du cours 1",
    });

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => courses,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => detailedCourse,
      } as Response);

    (globalThis.fetch as typeof fetch | undefined) = mockFetch as any;
    const apiFetchSpy = vi
      .spyOn(api, "apiFetch")
      .mockResolvedValue({ ok: true } as Response);

    localStorage.setItem("jwt_token", "token-actif");

    render(<App />);

    await screen.findByText("Header connecté");
    await screen.findByText("Cours 1");

    expect(screen.getByText("12 cours disponibles")).toBeTruthy();
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const searchInput = screen.getByLabelText("Recherche");
    fireEvent.change(searchInput, { target: { value: "Cours 2" } });

    await waitFor(() => {
      expect(screen.getByText("1 cours disponible")).toBeTruthy();
      expect(screen.getByText("Cours 2")).toBeTruthy();
      expect(screen.queryByText("Cours 3")).toBeNull();
    });

    fireEvent.click(screen.getByText("réinitialiser"));

    await waitFor(() => {
      expect(screen.getByText("12 cours disponibles")).toBeTruthy();
      expect(screen.getByText("Cours 3")).toBeTruthy();
    });

    expect(screen.getByLabelText("Go to next page")).toBeTruthy();

    fireEvent.click(
      screen.getAllByRole("button", { name: "Voir les détails" })[0],
    );

    await screen.findByText("Détails du cours 1");
    expect(mockFetch).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByText("ouvrir-document"));
    await screen.findByText("Visionneuse: Plan du cours");

    fireEvent.click(screen.getByText("fermer-visionneuse"));
    expect(screen.queryByText("Visionneuse: Plan du cours")).toBeNull();

    fireEvent.click(screen.getByText("fermer-détails"));
    await screen.findByText("Cours 4");

    fireEvent.click(screen.getByText("Ajouter un nouveau cours"));
    await screen.findByText("Dialogue ajout cours");

    fireEvent.click(screen.getByText("valider-ajout"));
    await screen.findByText("Nouveau cours collaboratif");

    fireEvent.click(screen.getByText("se-déconnecter"));

    await waitFor(() => {
      expect(apiFetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("auth/logout/"),
        expect.objectContaining({ method: "POST" }),
      );
      expect(localStorage.getItem("jwt_token")).toBeNull();
      expect(window.location.href).toBe("/");
    });
  });

  test("gère une réponse invalide lors du chargement initial", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
      } as Response);

    (globalThis.fetch as typeof fetch | undefined) = mockFetch as any;
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("0 cours disponible")).toBeTruthy();
    });

    consoleErrorSpy.mockRestore();
  });

  test.skip("gère les réponses paginées et les opérations de mise à jour/suppression", async () => {
    const courses = Array.from({ length: 3 }, (_, index) =>
      buildCourse(index + 1),
    );

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: courses }),
      } as Response);

    (globalThis.fetch as typeof fetch | undefined) = mockFetch as any;
    const apiFetchSpy = vi
      .spyOn(api, "apiFetch")
      .mockResolvedValue({ ok: true } as Response);

    render(<App />);

    await screen.findByText("3 cours disponibles");

    fireEvent.click(screen.getAllByRole("button", { name: "Voir les détails" })[0]);
    await screen.findByText("Détails du cours 1");

    fireEvent.click(screen.getByText("mettre-à-jour"));
    fireEvent.click(screen.getByText("fermer-détails"));

    await waitFor(() => {
      expect(screen.getByText("Cours 1 mis à jour")).toBeTruthy();
    });

    fireEvent.click(screen.getAllByRole("button", { name: "Voir les détails" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: /supprimer/i })[0]);
    fireEvent.click(screen.getByText("fermer-détails"));

    await waitFor(() => {
      expect(screen.getByText("2 cours disponibles")).toBeTruthy();
      expect(screen.queryByText("Cours 1 mis à jour")).toBeNull();
    });

    expect(apiFetchSpy).not.toHaveBeenCalled();
    apiFetchSpy.mockRestore();
  });
});
