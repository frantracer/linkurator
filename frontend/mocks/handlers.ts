import {rest} from "msw";
import {configuration} from "../configuration";
import subscriptionsList from "./fixtures/subscriptionsList.json";
import profile from "./fixtures/profile.json";

export const handlers = [
  rest.get(configuration.SUBSCRIPTIONS_URL, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(subscriptionsList))
  ),
  rest.get(configuration.PROFILE_URL, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(profile))
  ),
];
