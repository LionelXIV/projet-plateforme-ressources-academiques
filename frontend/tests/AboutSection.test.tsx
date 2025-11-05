import { render, screen } from "@testing-library/react";
import AboutSection from "../src/components/AboutSection";

describe("AboutSection", () => {
  test("met en avant la vision et les points forts de la plateforme", () => {
    render(<AboutSection />);

    expect(
      screen.getByText("À propos de la plateforme"),
    ).toBeTruthy();
    expect(
      screen.getByText(/Notre mission est de faciliter l'accès au savoir/i),
    ).toBeTruthy();
    expect(
      screen.getByText("Pourquoi choisir notre plateforme ?"),
    ).toBeTruthy();
    expect(
      screen.getByText("Cours de Qualité"),
    ).toBeTruthy();
    expect(
      screen.getByText(/ressources académiques au Québec/i),
    ).toBeTruthy();
  });
});
