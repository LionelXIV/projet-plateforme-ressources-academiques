import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import Header from "../src/components/Header";

vi.mock("../src/components/LoginDialog", () => ({
  default: ({ onLogin }: { onLogin: () => void }) => (
    <div>
      <p>Fenêtre de connexion</p>
      <button onClick={onLogin}>valider-connexion</button>
    </div>
  ),
}));

describe("Header", () => {
  test("affiche le bouton de connexion et appelle onLogin depuis le dialogue", async () => {
    const handleLogin = vi.fn();

    render(<Header isLoggedIn={false} onLogin={handleLogin} onLogout={() => {}} />);

    const loginButton = screen.getByRole("button", { name: /Connexion/i });
    expect(loginButton).toBeTruthy();
    expect(screen.queryByText("Déconnexion")).toBeNull();

    fireEvent.click(loginButton);

    await screen.findByText("Fenêtre de connexion");
    const confirmButton = screen.getByText("valider-connexion");
    fireEvent.click(confirmButton);

    expect(handleLogin).toHaveBeenCalledTimes(1);
  });

  test("affiche le bouton de déconnexion pour un administrateur connecté", () => {
    const handleLogout = vi.fn();

    render(<Header isLoggedIn onLogin={() => {}} onLogout={handleLogout} />);

    const logoutButton = screen.getByRole("button", { name: /Déconnexion/i });
    expect(logoutButton).toBeTruthy();

    fireEvent.click(logoutButton);
    expect(handleLogout).toHaveBeenCalledTimes(1);
  });
});
