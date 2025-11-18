import React, { createContext, useContext } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, SpyInstance } from "vitest";
import AddCourseDialog from "../src/components/AddCourseDialog";
import { Course } from "../src/types";
import * as api from "../src/lib/api";

type SelectContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const SelectContext = createContext<SelectContextValue | null>(null);

vi.mock("../src/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  DialogTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("../src/components/ui/select", () => ({
  Select: ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode;
    value: string;
    onValueChange: (value: string) => void;
  }) => (
    <SelectContext.Provider value={{ value, onValueChange }}>
      <div>{children}</div>
    </SelectContext.Provider>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectValue: ({
    placeholder,
  }: {
    placeholder?: string;
  }) => {
    const ctx = useContext(SelectContext);
    return <span>{ctx?.value || placeholder || ""}</span>;
  },
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({
    value,
    children,
  }: {
    value: string;
    children: React.ReactNode;
  }) => {
    const ctx = useContext(SelectContext);
    return (
      <button type="button" onClick={() => ctx?.onValueChange(value)}>
        {children}
      </button>
    );
  },
}));

vi.mock("../src/components/ui/button", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/components/ui/button")>();
  return actual;
});

let createObjectURLSpy: SpyInstance;

beforeAll(() => {
  createObjectURLSpy = vi
    .spyOn(global.URL, "createObjectURL")
    .mockImplementation(() => "blob:mocked-url");
});

afterAll(() => {
  createObjectURLSpy.mockRestore();
});

describe("AddCourseDialog", () => {
  test("affiche une erreur quand le titre est vide", async () => {
    const onClose = vi.fn();
    const onAddCourse = vi.fn();

    const { container } = render(
      <AddCourseDialog
        isOpen
        onClose={onClose}
        onAddCourse={onAddCourse}
        nextId={99}
      />,
    );

    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    expect(await screen.findByText("Le titre est requis.")).toBeTruthy();
    expect(onAddCourse).not.toHaveBeenCalled();
  });

  test("soumet un cours complet et renvoie le résultat à onAddCourse", async () => {
    const onClose = vi.fn();
    const onAddCourse = vi.fn();
    const createdCourse: Course = {
      id: 42,
      title: "Analyse avancée",
      description: "Résumé concis",
      fullDescription: "Description longue pour les étudiants motivés.",
      instructor: "Pr. Tremblay",
      category: "Développement",
      level: "Avancé",
      image: "https://uqar.ca/analyse.jpg",
      publishedAt: "2025-02-10",
      documents: [],
    };

    const apiFetchSpy = vi
      .spyOn(api, "apiFetch")
      .mockResolvedValue({
        ok: true,
        json: async () => createdCourse,
      } as Response);

    try {
      render(
        <AddCourseDialog
          isOpen
          onClose={onClose}
          onAddCourse={onAddCourse}
          nextId={3}
        />,
      );

      fireEvent.change(screen.getByLabelText(/Titre du cours/i), {
        target: { value: "Développement durable" },
      });
      fireEvent.change(screen.getByLabelText(/Instructeur/i), {
        target: { value: "Professeure Dion" },
      });
      fireEvent.change(screen.getByLabelText(/Description courte/i), {
        target: { value: "Introduction aux enjeux climatiques" },
      });
      fireEvent.change(screen.getByLabelText(/Description complète/i), {
        target: {
          value:
            "Cours détaillé présentant des cas pratiques pour la communauté académiques.",
        },
      });

      fireEvent.click(screen.getByText("Développement"));
      fireEvent.click(screen.getByText("Avancé"));

      fireEvent.change(screen.getByPlaceholderText("https://..."), {
        target: { value: "https://cdn.uqar.ca/course.png" },
      });

      const file = new File(["Plan"], "plan.pdf", {
        type: "application/pdf",
      });

      const dropZone = screen.getByText("Glissez-déposez vos fichiers ici");
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
          items: [],
        },
      });

      await screen.findByDisplayValue("plan.pdf");

      fireEvent.change(screen.getByDisplayValue("plan.pdf"), {
        target: { value: "Plan de cours 2025" },
      });

      fireEvent.click(
        screen.getByRole("button", { name: /Ajouter le cours/i }),
      );

      await waitFor(() => {
        expect(apiFetchSpy).toHaveBeenCalledTimes(1);
        expect(onAddCourse).toHaveBeenCalledWith(createdCourse);
        expect(onClose).toHaveBeenCalled();
      });

      const [, init] = apiFetchSpy.mock.calls[0];
      expect(init?.method).toBe("POST");

      const formData = init?.body as FormData;

// Vérifier les documents
const documents = formData.getAll('documents[]');
expect(documents.length).toBe(1);
expect((documents[0] as File).name).toBe("plan.pdf"); // fichier réel
expect((documents[0] as File).type).toBe("application/pdf");
expect(formData.get("title")).toBe("Développement durable");
expect(formData.get("category")).toBe("Développement");
expect(formData.get("level")).toBe("Avancé");

    } finally {
      apiFetchSpy.mockRestore();
    }
  });

  test("bascule en mode upload et affiche une erreur provenant de l'API", async () => {
    const onClose = vi.fn();
    const onAddCourse = vi.fn();

    const apiFetchSpy = vi
      .spyOn(api, "apiFetch")
      .mockResolvedValue({
        ok: false,
        json: async () => ({ detail: "Impossible" }),
      } as Response);

    const { getByText } = render(
      <AddCourseDialog
        isOpen
        onClose={onClose}
        onAddCourse={onAddCourse}
        nextId={5}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Titre du cours/i), {
      target: { value: "Gestion de projet" },
    });
    fireEvent.change(screen.getByLabelText(/Instructeur/i), {
      target: { value: "Mme Roy" },
    });
    fireEvent.change(screen.getByLabelText(/Description courte/i), {
      target: { value: "Cours synthétique" },
    });
    fireEvent.change(screen.getByLabelText(/Description complète/i), {
      target: { value: "Description longue" },
    });
    fireEvent.click(getByText("Développement"));
    fireEvent.click(getByText("Avancé"));

    fireEvent.click(screen.getByText("Uploader"));

    const imageDrop = screen.getByText("Glissez une image ici");
    const imageFile = new File(["image"], "image.png", { type: "image/png" });
    fireEvent.drop(imageDrop, {
      dataTransfer: {
        files: [imageFile],
        items: [],
      },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Ajouter le cours/i }),
    );

    await screen.findByText("Impossible");
    expect(onAddCourse).not.toHaveBeenCalled();
    apiFetchSpy.mockRestore();
  });
});
