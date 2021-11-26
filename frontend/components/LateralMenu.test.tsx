import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import React from "react";
import LateralMenu from "./LateralMenu";
import { clickOnText } from "../utilities/tests";

describe("LateralMenu should", () => {
  it("show all topics", async () => {
    render(<LateralMenu onClickTopic={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Blog"));
      expect(screen.getByText("Portfolio"));
      expect(screen.getByText("About"));
      expect(screen.getByText("Contact"));
    });
  });

  it("select an item when clicked", async () => {
    render(<LateralMenu onClickTopic={jest.fn()} />);

    await clickOnText("Blog");

    expect(screen.getByText("Blog")).toHaveClass("focus:bg-blue-400");
  });

  it("report when an item is clicked", async () => {
    const onClick = jest.fn();
    render(<LateralMenu onClickTopic={onClick} />);

    await clickOnText("Blog");

    expect(onClick).toHaveBeenCalledWith(
      "3fa85f64-5717-4562-b3fc-2c963f66afa1"
    );
  });

  it("select an item when clicked", async () => {
    render(<LateralMenu onClickTopic={jest.fn()} />);

    await clickOnText("Blog");

    expect(screen.getByText("Blog")).toHaveClass("focus:bg-blue-400");
  });
});
