import {screen, render, waitFor} from "@testing-library/react";
import {
  givenApiReturningErrorWhileRetrievingProfile,
  givenProfile,
} from "../utilities/tests/preconditions";
import useProfile, {Profile} from "./useProfile";

const profile: Profile = {
  first_name: "Rafael",
  last_name: "Guilherme",
  avatar_url: "https://avatars.com/my-avatar.jpeg",
};

const DummyComponent = () => {
  const profile = useProfile();

  if (!profile) return <></>;

  return (
    <>
      <div>{profile?.first_name}</div>
      <div>{profile?.last_name}</div>
      <div>{profile?.avatar_url}</div>
    </>
  );
};

describe("useProfile should", () => {
  it("return profile information coming from API", async () => {
    givenProfile(profile);

    render(<DummyComponent/>);

    await waitFor(() => {
      expect(screen.getByText("Rafael"));
      expect(screen.getByText("Guilherme"));
      expect(screen.getByText("https://avatars.com/my-avatar.jpeg"));
    });
  });

  it("return undefined if cannot load profile", () => {
    givenApiReturningErrorWhileRetrievingProfile();

    const {container} = render(<DummyComponent/>);

    expect(container.firstChild).toBeNull();
  });
});
