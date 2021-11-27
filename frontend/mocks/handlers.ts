import { rest } from "msw";
import configuration from "../configuration";
import topicsList from "./fixtures/topicsList.json";

export const handlers = [
  rest.get(configuration.TOPICS_URL, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(topicsList))
  ),
  rest.get(configuration.PROFILE_URL, (req, res, ctx) =>
    res(
      ctx.status(200),
      ctx.json({
        firstName: "Ruben",
        lastName: "Aguilar",
        avatar:
          "https://lh3.googleusercontent.com/a-/AOh14Gg16Z9DCQfFWPpsnO7ULEv_c7tvMo-_uFcpMTq8pA=s576-p-rw-no",
      })
    )
  ),
];
