import {render, screen, waitFor} from "@testing-library/react";
import {
  givenApiReturningErrorWhileRetrievingSubscriptions,
  givenSubscriptions,
} from "../utilities/tests/preconditions";
import useSubscriptions, {SubscriptionResponse} from "./useSubscriptions";

const DummyComponent = () => {
  const subscriptions = useSubscriptions();

  const subscriptionsIds = subscriptions.map((t) => <div key={t.uuid}>{t.uuid}</div>);

  return <div>{subscriptionsIds}</div>;
};

const subscriptionsResponse: SubscriptionResponse = {
  elements: [
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
  ]
}

describe("useSubscriptions should", () => {
  it("return subscriptions", async () => {
    givenSubscriptions(subscriptionsResponse);
    render(<DummyComponent/>);

    await waitFor(() => {
      expect(screen.getByText("1"));
      expect(screen.getByText("2"));
    });
  });

  it("return empty array when cannot retrieve subscriptions", async () => {
    givenApiReturningErrorWhileRetrievingSubscriptions();
    const {container} = render(<DummyComponent/>);

    await waitFor(() => {
      expect(container.firstChild).toBeEmptyDOMElement();
    });
  });
});
