import { render, screen, waitFor } from "@testing-library/react";
import {
  givenApiReturningErrorWhileRetrievingTopics,
  givenTopics,
} from "../utilities/tests/preconditions";
import useTopics, { Topic } from "./useTopics";

const DummyComponent = () => {
  const topics = useTopics();

  const topicIds = topics.map((t) => <div key={t.id}>{t.id}</div>);

  return <div>{topicIds}</div>;
};

const topics: Topic[] = [
  {
    id: "1",
    name: "Technology",
    subscriptions: [],
  },
  {
    id: "2",
    name: "Sports",
    subscriptions: [],
  },
];

describe("useTopics should", () => {
  it("return topics", async () => {
    givenTopics(topics);
    render(<DummyComponent />);

    await waitFor(() => {
      expect(screen.getByText("1"));
      expect(screen.getByText("2"));
    });
  });

  it("return empty array when cannot retrieve topics", async () => {
    givenApiReturningErrorWhileRetrievingTopics();
    const { container } = render(<DummyComponent />);

    waitFor(() => {
      expect(container.firstChild).toBeEmptyDOMElement();
    });
  });
});
