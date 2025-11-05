import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import CourseDetail from "../src/components/CourseDetail";
import type { Course } from "../src/types";

const apiMocks = vi.hoisted(() => ({
  getCourse: vi.fn(),
  deleteCourse: vi.fn(),
  apiFetch: vi.fn(),
}));

vi.mock("../src/lib/api", () => apiMocks);

const buildCourse = (overrides: Partial<Course> = {}): Course => ({
  id: 10,
  title: "Architecture logicielle",
  description: "Concevoir des solutions fiables",
  fullDescription: "Analyse, conception et maintenance des architectures.",
  instructor: "Dr. Blanchet",
  category: "Ingénierie",
  level: "Avancé",
  image: "/images/architecture.jpg",
  publishedAt: "2025-01-01",
  students: 128,
  documents: [
    {
      id: 1,
      name: "Syllabus",
      type: "PDF",
      size: "2 Mo",
      url: "https://cdn.example.com/syllabus.pdf",
    },
  ],
  ...overrides,
});

describe("CourseDetail", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    apiMocks.deleteCourse.mockResolvedValue({});
    apiMocks.apiFetch.mockReset();
    apiMocks.getCourse.mockReset();
  });

  test("affiche les détails, permet la prévisualisation et la sauvegarde", async () => {
    const course = buildCourse();
    const onClose = vi.fn();
    const onViewDocument = vi.fn();
    const onDelete = vi.fn();
    const onUpdate = vi.fn();

    apiMocks.apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ ...course, title: "Architecture moderne" }),
    } as any);

    render(
      <CourseDetail
        courseId={course.id}
        initial={course}
        onClose={onClose}
        onViewDocument={onViewDocument}
        isLoggedIn
        onDelete={onDelete}
        onUpdate={onUpdate}
      />,
    );

    expect(
      screen.getByText("Architecture logicielle"),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Voir/i }));
    expect(onViewDocument).toHaveBeenCalledWith(course.documents?.[0]);

    fireEvent.click(screen.getByRole("button", { name: /Modifier/i }));
    const titleInput = screen.getByDisplayValue("Architecture logicielle");
    fireEvent.change(titleInput, { target: { value: "Architecture moderne" } });

    fireEvent.click(screen.getByRole("button", { name: /Sauvegarder/i }));

    await waitFor(() => expect(apiMocks.apiFetch).toHaveBeenCalled());
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Architecture moderne" }),
    );

    const confirmMock = vi.fn(() => true);
    vi.stubGlobal("confirm", confirmMock);
    fireEvent.click(
      screen.getByRole("button", { name: /Supprimer le cours/i }),
    );

    await waitFor(() => expect(apiMocks.deleteCourse).toHaveBeenCalledWith(10));
    expect(onDelete).toHaveBeenCalledWith(10);
    expect(confirmMock).toHaveBeenCalled();
    vi.unstubAllGlobals();

    fireEvent.click(
      screen.getByRole("button", { name: /Retour aux cours/i }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  test("charge les données lorsqu'aucun initial n'est fourni", async () => {
    const course = buildCourse();
    apiMocks.getCourse.mockResolvedValue(course);

    render(<CourseDetail courseId={course.id} />);

    await waitFor(() => {
      expect(apiMocks.getCourse).toHaveBeenCalledWith(course.id);
      expect(screen.getByText("Architecture logicielle")).toBeTruthy();
    });
  });

  test("affiche une erreur lorsque le chargement échoue", async () => {
    apiMocks.getCourse.mockRejectedValue(new Error("boom"));

    render(<CourseDetail courseId={55} />);

    await waitFor(() => {
      const node = screen.getByText(/Erreur:/i);
      expect(node.textContent).toBe("Erreur: boom");
    });
  });
});
