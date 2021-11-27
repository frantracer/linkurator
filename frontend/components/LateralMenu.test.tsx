import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import React from "react";
import LateralMenu from "./LateralMenu";
import { clickOnText } from "../utilities/tests";

describe("LateralMenu should", () => {
  it("show all topics", async () => {
    render(<LateralMenu onClickTopic={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Technology"));
      expect(screen.getByText("Sports"));
      expect(screen.getByText("Videogames"));
      expect(screen.getByText("Psychology"));
    });
  });

  it("select an item when clicked", async () => {
    render(<LateralMenu onClickTopic={jest.fn()} />);

    await clickOnText("Technology");

    expect(screen.getByText("Technology")).toHaveClass("bg-gray-200");
  });

  it("report when an item is clicked", async () => {
    const onClick = jest.fn();
    render(<LateralMenu onClickTopic={onClick} />);

    await clickOnText("Technology");

    expect(onClick).toHaveBeenCalledWith(
      "3fa85f64-5717-4562-b3fc-2c963f66afa1"
    );
  });

  it("select an item when clicked", async () => {
    render(<LateralMenu onClickTopic={jest.fn()} />);

    await clickOnText("Technology");

    expect(screen.getByText("Technology")).toHaveClass("bg-gray-200");
  });
});
