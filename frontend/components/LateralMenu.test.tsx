import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import LateralMenu from "./LateralMenu";

describe("LateralMenu should", () => {
  it("show all topics", async () => {
    render(<LateralMenu />);

    await waitFor(() => {
      expect(screen.getByText("Blog"));
      expect(screen.getByText("Portfolio"));
      expect(screen.getByText("About"));
      expect(screen.getByText("Contact"));
    });
  });
});
