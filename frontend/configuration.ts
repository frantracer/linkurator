const WEB_BASE_URL = 'https://www.linkurator.com';
const API_BASE_URL = 'https://api.linkurator.com:9000';
const SUBSCRIPTIONS_URL = `${API_BASE_URL}/subscriptions/`;
const PROFILE_URL = `${API_BASE_URL}/profile/`;
const LOGIN_URL = `${API_BASE_URL}/login/?redirect_uri=${encodeURI(WEB_BASE_URL)}`;
const LOGOUT_URL = `${API_BASE_URL}/logout/?redirect_uri=${encodeURI(WEB_BASE_URL)}`;

const configuration = {
  SUBSCRIPTIONS_URL,
  PROFILE_URL,
  LOGIN_URL,
  LOGOUT_URL
};

export default configuration;
