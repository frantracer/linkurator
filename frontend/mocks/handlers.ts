import { rest } from "msw";
import configuration from "../configuration";
import topicsList from "./fixtures/topicsList.json";

export const handlers = [
  rest.get(configuration.TOPICS_URL, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(topicsList))
  ),
];
