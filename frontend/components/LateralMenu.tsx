import {MenuItem} from "./MenuItem";
import {Subscription} from "../hooks/useSubscriptions";
import {useState} from "react";
import {Profile} from "../hooks/useProfile";
import configuration from "../configuration";

type LateralMenuProps = {
  subscriptions: Subscription[];
  profile: Profile;
  onClickSubscription: (subscription: Subscription) => void;
};

const Title = () => (
  <div className="flex flex-row items-center justify-between flex-shrink-0 px-8 py-4">
    <a
      href="#"
      className="text-lg font-semibold tracking-widest text-gray-900 uppercase rounded-lg focus:outline-none focus:shadow-outline"
    >
      Linkurator
    </a>
    <button className="rounded-lg md:hidden focus:outline-none focus:shadow-outline">
      Linkurator
    </button>
  </div>
);

const LateralMenu = (props: LateralMenuProps) => {
  const {subscriptions, profile} = props;
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription>();

  const handleClick = (subscriptionId: string) => {
    const subscription = subscriptions.find((subscription) => subscription.uuid === subscriptionId);
    if (subscription) {
      setSelectedSubscription(subscription);
      props.onClickSubscription(subscription);
    }
  };

  const items = subscriptions.map((subscription) => (
    <MenuItem
      title={subscription.name}
      key={subscription.uuid}
      onClick={() => handleClick(subscription.uuid)}
      selected={subscription.uuid === selectedSubscription?.uuid}
    />
  ));

  const loginSvg = "M416 448h-84c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h84c17.7 0 32-14.3 32-32V160c0-17.7-14.3-32-32-32h-84c-6.6 0-12-5.4-12-12V76c0-6.6 5.4-12 12-12h84c53 0 96 43 96 96v192c0 53-43 96-96 96zm-47-201L201 79c-15-15-41-4.5-41 17v96H24c-13.3 0-24 10.7-24 24v96c0 13.3 10.7 24 24 24h136v96c0 21.5 26 32 41 17l168-168c9.3-9.4 9.3-24.6 0-34z"
  const logoutSvg = "M497 273L329 441c-15 15-41 4.5-41-17v-96H152c-13.3 0-24-10.7-24-24v-96c0-13.3 10.7-24 24-24h136V88c0-21.4 25.9-32 41-17l168 168c9.3 9.4 9.3 24.6 0 34zM192 436v-40c0-6.6-5.4-12-12-12H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h84c6.6 0 12-5.4 12-12V76c0-6.6-5.4-12-12-12H96c-53 0-96 43-96 96v192c0 53 43 96 96 96h84c6.6 0 12-5.4 12-12z"

  const LoginButton = () => (
    <button
      className="hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:shadow-outline rounded-lg px-2"
      title={profile ? "Logout" : "Login"}
      onClick={() => {
        profile ?
          window.open(configuration.LOGOUT_URL + '?redirect_uri=http%3A%2F%2Flocalhost%3A3000', '_self') :
          window.open(configuration.LOGIN_URL + '?redirect_uri=http%3A%2F%2Flocalhost%3A3000', '_self')
      }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        className="w-6 h-6 mx-3">
        <path d={profile ? logoutSvg : loginSvg}/>
      </svg>
    </button>
  );

  const Avatar = (props: { img: string }) => (
    <img
      className="inline-block rounded-full w-7 h-7 ring-1 ring-white"
      src={props.img}
      alt=""
    />
  );

  return (
    <div className="sticky top-0 flex-col h-screen bg-white shadow-lg md:flex md:flex-row">
      <div className="flex flex-col flex-shrink-0 w-full text-gray-700 bg-white md:w-64">
        <Title/>
        <div className="flex flex-row justify-between py-4 px-7">
          <h2 className="text-2xl font-bold">{profile ? profile.first_name : "Guest"}</h2>
          <div className="flex">
            <LoginButton/>
            <Avatar img={profile ? profile.avatar_url : ""}/>
          </div>
        </div>
        <nav className="flex-grow pb-4 px-7 md:block md:pb-0 md:overflow-y-auto">
          {items}
        </nav>
      </div>
    </div>
  );
};

export default LateralMenu;
