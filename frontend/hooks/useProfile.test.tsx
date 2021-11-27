import { screen, render, waitFor } from "@testing-library/react";
import {
  givenApiReturningErrorWhileRetrievingProfile,
  givenProfile,
} from "../utilities/tests/preconditions";
import useProfile, { Profile } from "./useProfile";

const profile: Profile = {
  firstName: "Rafael",
  lastName: "Guilherme",
  avatar: "https://avatars.com/my-avatar.jpeg",
};

const DummyComponent = () => {
  const profile = useProfile();

  if (!profile) return <></>;

  return (
    <>
      <div>{profile?.firstName}</div>
      <div>{profile?.lastName}</div>
      <div>{profile?.avatar}</div>
    </>
  );
};

describe("useProfile should", () => {
  it("return profile information coming from API", async () => {
    givenProfile(profile);

    render(<DummyComponent />);

    await waitFor(() => {
      expect(screen.getByText("Rafael"));
      expect(screen.getByText("Guilherme"));
      expect(screen.getByText("https://avatars.com/my-avatar.jpeg"));
    });
  });

  it("return undefined if cannot load profile", () => {
    givenApiReturningErrorWhileRetrievingProfile();

    const { container } = render(<DummyComponent />);

    expect(container.firstChild).toBeNull();
  });
});
