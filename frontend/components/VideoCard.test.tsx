import { render, screen } from "@testing-library/react";
import React from "react";
import VideoCard from "./VideoCard";

describe("VideoCard should", () => {
  it("render image", () => {
    renderCard({ img: "https://myImage.com/image.jpeg" });

    expect(screen.getByTestId("video-card-image")).toHaveStyle(
      "background-image: url(https://myImage.com/image.jpeg)"
    );
  });

  it("render name", () => {
    renderCard({ name: "Card Name" });

    const name = screen.getByText("Card Name");

    expect(name).toBeInTheDocument();
  });

  it("render description", () => {
    renderCard({ description: "Card Description" });

    const description = screen.getByText("Card Description");

    expect(description).toBeInTheDocument();
  });
});

function renderCard(props: {
  img?: string;
  name?: string;
  description?: string;
}) {
  return render(
    <VideoCard
      img={props.img ? props.img : ""}
      name={props.name ? props.name : ""}
      description={props.description ? props.description : ""}
      url={props.img ? props.img : ""}
    />
  );
}
