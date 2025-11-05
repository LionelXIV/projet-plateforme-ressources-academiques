import { render, screen } from "@testing-library/react";
import Footer from "../src/components/Footer";

describe("Footer", () => {
  test("affiche les mentions légales et le message étudiant", () => {
    render(<Footer />);

    expect(
      screen.getByText(
        "© 2025 UQAR - Plateforme de Ressources Académiques. Tous droits réservés.",
      ),
    ).toBeTruthy();
    expect(
      screen.getByText("Développé par des étudiants, pour des étudiants 🎓"),
    ).toBeTruthy();
  });
});
