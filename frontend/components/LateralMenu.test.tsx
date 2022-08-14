import {render, screen, waitFor} from "@testing-library/react";
import React from "react";
import LateralMenu from "./LateralMenu";
import {clickOnText} from "../utilities/tests/actions";
import {Profile} from "../hooks/useProfile";

const dummyProfile: Profile = {
  last_name: "Dummy",
  first_name: "Dummy",
  avatar_url: "https://dummy.com"
}

const subscriptions = [
  {
    uuid: "1",
    name: "Technology",
    thumbnail: "https://via.placeholder.com/1",
    url: "https://www.youtube.com/channel/1",
  },
  {
    uuid: "2",
    name: "Sports",
    thumbnail: "https://via.placeholder.com/2",
    url: "https://www.youtube.com/channel/2",
  },
  {
    uuid: "3",
    name: "Videogames",
    thumbnail: "https://via.placeholder.com/3",
    url: "https://www.youtube.com/channel/3",
  },
  {
    uuid: "4",
    name: "Psychology",
    thumbnail: "https://via.placeholder.com/4",
    url: "https://www.youtube.com/channel/4",
  },
];

describe("LateralMenu should", () => {
  it("show all subscriptions", async () => {
    render(<LateralMenu profile={dummyProfile} subscriptions={subscriptions} onClickSubscription={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Technology"));
      expect(screen.getByText("Sports"));
      expect(screen.getByText("Videogames"));
      expect(screen.getByText("Psychology"));
    });
  });

  it("select an item when clicked", async () => {
    render(<LateralMenu profile={dummyProfile} subscriptions={subscriptions} onClickSubscription={jest.fn()} />);

    await clickOnText("Technology");

    expect(screen.getByText("Technology")).toHaveClass("bg-gray-200");
  });

  it("report when an item is clicked", async () => {
    const onClick = jest.fn();
    render(<LateralMenu profile={dummyProfile} subscriptions={subscriptions} onClickSubscription={onClick} />);

    await clickOnText("Technology");

    expect(onClick).toHaveBeenCalledWith(subscriptions[0]);
  });

  it("select an item when clicked", async () => {
    render(<LateralMenu profile={dummyProfile} subscriptions={subscriptions} onClickSubscription={jest.fn()} />);

    await clickOnText("Technology");

    expect(screen.getByText("Technology")).toHaveClass("bg-gray-200");
  });
});
