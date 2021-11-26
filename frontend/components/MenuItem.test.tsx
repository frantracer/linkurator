import { render, screen } from "@testing-library/react";
import { MenuItem } from "./MenuItem";

describe("MenuItem", () => {
  it("Show item name", () => {
    render(<MenuItem title="Item Title" />);

    expect(screen.getByText("Item Title"));
  });
});
