import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const renderMock = vi.fn();
  const createRootMock = vi.fn(() => ({ render: renderMock }));
  return { renderMock, createRootMock };
});

vi.mock("react-dom/client", () => ({
  createRoot: mocks.createRootMock,
}));

vi.mock("../src/App", () => ({
  default: () => <div>App</div>,
}));

describe("main entrypoint", () => {
  beforeEach(() => {
    mocks.renderMock.mockClear();
    mocks.createRootMock.mockClear();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.resetModules();
  });

  test("initialise l'application React sur l'élément #root", async () => {
    const mount = document.createElement("div");
    mount.id = "root";
    document.body.appendChild(mount);

    await import("../src/main");

    expect(mocks.createRootMock).toHaveBeenCalledWith(mount);
    expect(mocks.renderMock).toHaveBeenCalled();
  });
});
