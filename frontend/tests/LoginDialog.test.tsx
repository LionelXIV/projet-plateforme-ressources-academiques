import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import LoginDialog from "../src/components/LoginDialog";

vi.mock("../src/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

beforeEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("LoginDialog", () => {
  test("affiche une erreur quand l'API refuse la connexion", async () => {
    vi.stubEnv("VITE_API_URL_LOGIN", "https://auth.example.com/");
    const onLogin = vi.fn();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Identifiants invalides" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { container } = render(<LoginDialog onLogin={onLogin} />);

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "admin@uqar.ca" },
    });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Se connecter/i }));

    await screen.findByText("Identifiants invalides");
    expect(onLogin).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://auth.example.com/auth/login/",
      expect.objectContaining({ method: "POST" }),
    );
  });

  test("enregistre le token et appelle onLogin en cas de succès", async () => {
    vi.stubEnv("VITE_API_URL_LOGIN", "https://auth.example.com/");
    const onLogin = vi.fn();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: "jwt-token" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { container } = render(<LoginDialog onLogin={onLogin} />);

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "admin@uqar.ca" },
    });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: "super-secret" },
    });
    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    await waitFor(() => expect(onLogin).toHaveBeenCalled());
    expect(localStorage.getItem("jwt_token")).toBe("jwt-token");
  });
});
