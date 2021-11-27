import { rest } from "msw";
import configuration from "../../configuration";
import { Profile } from "../../hooks/useProfile";
import { Topic } from "../../hooks/useTopics";
import { server } from "../../mocks/tests";

export const givenTopics = (topics: Topic[]) => {
  server.use(
    rest.get(configuration.TOPICS_URL, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(topics));
    })
  );
};

export const givenApiReturningErrorWhileRetrievingTopics = () => {
  server.use(
    rest.get(configuration.TOPICS_URL, (req, res, ctx) => {
      return res(ctx.status(500));
    })
  );
};

export const givenProfile = (profile: Profile) => {
  server.use(
    rest.get(configuration.PROFILE_URL, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(profile));
    })
  );
};

export const givenApiReturningErrorWhileRetrievingProfile = () => {
  server.use(
    rest.get(configuration.PROFILE_URL, (req, res, ctx) => {
      return res(ctx.status(500));
    })
  );
};
