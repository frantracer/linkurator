import {rest} from "msw";
import configuration from "../../configuration";
import {Profile} from "../../hooks/useProfile";
import {SubscriptionResponse} from "../../hooks/useSubscriptions";
import {server} from "../../mocks/tests";

export const givenSubscriptions = (subscriptionResponse: SubscriptionResponse) => {
  server.use(
    rest.get(configuration.SUBSCRIPTIONS_URL, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(subscriptionResponse));
    })
  );
};

export const givenApiReturningErrorWhileRetrievingSubscriptions = () => {
  server.use(
    rest.get(configuration.SUBSCRIPTIONS_URL, (req, res, ctx) => {
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
