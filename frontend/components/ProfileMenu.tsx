import {Profile} from "../hooks/useProfile";
import configuration from "../configuration";

type ProfileMenuProps = {
  profile: Profile | undefined
}

const ProfileMenu = (props: ProfileMenuProps) => {
  const loginSvg = "M416 448h-84c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h84c17.7 0 32-14.3 32-32V160c0-17.7-14.3-32-32-32h-84c-6.6 0-12-5.4-12-12V76c0-6.6 5.4-12 12-12h84c53 0 96 43 96 96v192c0 53-43 96-96 96zm-47-201L201 79c-15-15-41-4.5-41 17v96H24c-13.3 0-24 10.7-24 24v96c0 13.3 10.7 24 24 24h136v96c0 21.5 26 32 41 17l168-168c9.3-9.4 9.3-24.6 0-34z"
  const logoutSvg = "M497 273L329 441c-15 15-41 4.5-41-17v-96H152c-13.3 0-24-10.7-24-24v-96c0-13.3 10.7-24 24-24h136V88c0-21.4 25.9-32 41-17l168 168c9.3 9.4 9.3 24.6 0 34zM192 436v-40c0-6.6-5.4-12-12-12H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h84c6.6 0 12-5.4 12-12V76c0-6.6-5.4-12-12-12H96c-53 0-96 43-96 96v192c0 53 43 96 96 96h84c6.6 0 12-5.4 12-12z"

  const LoginButton = () => (
    <button
      className="hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:shadow-outline rounded-lg px-2"
      title={props.profile ? "Logout" : "Login"}
      onClick={() => {
        props.profile ?
          window.open(configuration.LOGOUT_URL, '_self') :
          window.open(configuration.LOGIN_URL, '_self')
      }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        className="w-6 h-6 mx-3">
        <path d={props.profile ? logoutSvg : loginSvg}/>
      </svg>
    </button>
  );

  const Avatar = (props: { img: string, userName: string }) => (
    <img
      className="inline-block rounded-full w-7 h-7 ring-1 ring-white"
      src={props.img}
      alt=""
    />
  );

  return (
    <div className="flex flex-row justify-between py-4 px-7">
      <h2 className="text-2xl font-bold">{props.profile ? props.profile.first_name : "Guest"}</h2>
      <div className="flex">
        <LoginButton/>
        {props.profile && <Avatar img={props.profile.avatar_url} userName={props.profile.first_name}/>}
      </div>
    </div>
  )
}

export default ProfileMenu;