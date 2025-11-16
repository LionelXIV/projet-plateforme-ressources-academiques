import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";

vi.hoisted(() => {
  vi.stubEnv("VITE_API_URL", "https://api.uqar.test");
  vi.stubEnv("VITE_API_URL_LOGIN", "https://auth.uqar.test/");
});

import * as api from "../src/lib/api";

const originalFetch = globalThis.fetch;
let fetchSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  fetchSpy = vi.fn();
  globalThis.fetch = fetchSpy as unknown as typeof fetch;
});

afterAll(() => {
  globalThis.fetch = originalFetch;
  vi.unstubAllEnvs();
});

describe("apiFetch", () => {
  test("ajoute le jeton JWT et force Content-Type par défaut", async () => {
    localStorage.setItem("jwt_token", "token-xyz");
    fetchSpy.mockResolvedValue(
      new Response(null, { status: 200 }) as Response,
    );

    await api.apiFetch("/courses", { method: "GET" });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://api.uqar.test/courses");

    const headers = init?.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer token-xyz");
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(init?.credentials).toBe("include");
  });

  test("conserve un FormData sans forcer Content-Type", async () => {
    const formData = new FormData();
    formData.append("file", new Blob(["contenu"]), "cours.pdf");
    fetchSpy.mockResolvedValue(
      new Response(null, { status: 200 }) as Response,
    );

    await api.apiFetch("https://extern.uqar.test/upload", {
      method: "POST",
      body: formData,
    });

    const [, init] = fetchSpy.mock.calls[0];
    const headers = init?.headers as Headers;
    expect(headers.has("Content-Type")).toBe(false);
  });
});

describe("getCourse", () => {
  test("rejette pour un identifiant invalide", async () => {
    await expect(api.getCourse(0)).rejects.toThrow("Invalid course id");
    await expect(api.getCourse(-5)).rejects.toThrow("Invalid course id");
  });

  test("retourne les détails du cours quand la requête réussit", async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({ id: 12, title: "Statistiques participatives" }),
        { status: 200 },
      ) as Response,
    );

    const course = await api.getCourse(12);
    expect(course).toMatchObject({ id: 12, title: "Statistiques participatives" });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.uqar.test/courses/12/",
      expect.objectContaining({ method: "GET" }),
    );
  });

  test("lève une erreur quand l'API renvoie un statut HTTP invalide", async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ error: "Introuvable" }), {
        status: 404,
      }) as Response,
    );

    await expect(api.getCourse(77)).rejects.toThrow("Introuvable");
  });
});

describe("deleteCourse", () => {
  test("fait appel à apiFetch pour supprimer un cours", async () => {
    localStorage.setItem("jwt_token", "token-secret");
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ deleted: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }) as Response,
    );

    const result = await api.deleteCourse(9);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://api.uqar.test/courses/9/");
    const headers = init?.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer token-secret");
    expect(init?.method).toBe("DELETE");
    expect(result).toMatchObject({ deleted: true });
  });

  test("relève une erreur en cas d'échec", async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ detail: "Impossible" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }) as Response,
    );

    await expect(api.deleteCourse(3)).rejects.toThrow("Impossible");

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.uqar.test/courses/3/",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
