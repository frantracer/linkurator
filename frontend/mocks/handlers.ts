import { rest } from "msw";
import configuration from "../configuration";
import topicsList from "./fixtures/topicsList.json";
import profile from "./fixtures/profile.json";

export const handlers = [
  rest.get(configuration.TOPICS_URL, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(topicsList))
  ),
  rest.get(configuration.PROFILE_URL, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(profile))
  ),
];
