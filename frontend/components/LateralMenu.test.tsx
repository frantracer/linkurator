import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import React from "react";
import LateralMenu from "./LateralMenu";
import { clickOnText } from "../utilities/tests";

const topics = [
  {
    id: "1",
    name: "Technology",
    description: "Technology description",
    subscriptions: [],
  },
  {
    id: "2",
    name: "Sports",
    description: "Sports description",
    subscriptions: [],
  },
  {
    id: "3",
    name: "Videogames",
    description: "Videogames description",
    subscriptions: [],
  },
  {
    id: "4",
    name: "Psychology",
    description: "Videogames",
    subscriptions: [],
  },
];

describe("LateralMenu should", () => {
  it("show all topics", async () => {
    render(<LateralMenu topics={topics} onClickTopic={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Technology"));
      expect(screen.getByText("Sports"));
      expect(screen.getByText("Videogames"));
      expect(screen.getByText("Psychology"));
    });
  });

  it("select an item when clicked", async () => {
    render(<LateralMenu topics={topics} onClickTopic={jest.fn()} />);

    await clickOnText("Technology");

    expect(screen.getByText("Technology")).toHaveClass("bg-gray-200");
  });

  it("report when an item is clicked", async () => {
    const onClick = jest.fn();
    render(<LateralMenu topics={topics} onClickTopic={onClick} />);

    await clickOnText("Technology");

    expect(onClick).toHaveBeenCalledWith(topics[0]);
  });

  it("select an item when clicked", async () => {
    render(<LateralMenu topics={topics} onClickTopic={jest.fn()} />);

    await clickOnText("Technology");

    expect(screen.getByText("Technology")).toHaveClass("bg-gray-200");
  });
});
