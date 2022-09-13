import { render, screen } from "@testing-library/react";
import React from "react";
import VideoCard from "./VideoCard";
import {SubscriptionItem} from "../entities/SubscriptionItem";

describe("VideoCard should", () => {
  it("render image", () => {
    const url = "https://myImage.com/image.jpeg"
    renderCard({ img: url });

    const image = screen.getByRole("img");

    expect(image).toHaveAttribute("src", url);
  });

  it("render name", () => {
    renderCard({ name: "Card Name" });

    const name = screen.getByText("Card Name");

    expect(name).toBeInTheDocument();
  });
});

function renderCard(props: {
  img?: string;
  name?: string;
}) {

  const item: SubscriptionItem = {
    uuid: "uuid",
    subscription_uuid: "subscription_uuid",
    name: props.name || "Card Name",
    thumbnail: props.img || "https://myImage.com/image.jpeg",
    url: "https://myImage.com/image.jpeg",
    published_at: new Date(),
    discouraged: false,
    recommended: false,
    hidden: false,
    viewed: false,
  }
  return render(
    <VideoCard
      item={item}
      subscription={undefined}
    />
  );
}
