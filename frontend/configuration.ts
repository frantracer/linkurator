const WEB_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://www.linkurator.com';
const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:9000' : 'https://api.linkurator.com';
const SUBSCRIPTIONS_URL = `${API_BASE_URL}/subscriptions/`;
const TOPICS_URL = `${API_BASE_URL}/topics/`;
const ITEMS_URL = `${API_BASE_URL}/items/`;
const PROFILE_URL = `${API_BASE_URL}/profile/`;
const WEB_LOGIN_URL = `${WEB_BASE_URL}/login/`;
const LOGIN_URL = `${API_BASE_URL}/login/?redirect_uri=${encodeURI(WEB_LOGIN_URL)}`;
const LOGOUT_URL = `${API_BASE_URL}/logout/?redirect_uri=${encodeURI(WEB_LOGIN_URL)}`;
const REGISTER_URL = `${API_BASE_URL}/register/?redirect_uri=${encodeURI(WEB_LOGIN_URL)}`;
const TERMS_OF_SERVICE_URL = `${WEB_BASE_URL}/tos`;
const PRIVACY_POLICY_URL = `${WEB_BASE_URL}/privacy`;

const configuration = {
  SUBSCRIPTIONS_URL,
  PROFILE_URL,
  LOGIN_URL,
  LOGOUT_URL,
  REGISTER_URL,
  TOPICS_URL,
  ITEMS_URL,
  API_BASE_URL,
  TERMS_OF_SERVICE_URL,
  PRIVACY_POLICY_URL
};

const paths = {
  HOME: '/',
  LOGIN: '/login',
  LOGOUT: '/logout',
  TOPICS: '/topics',
  SUBSCRIPTIONS: '/subscriptions',
  PROFILE: '/profile',
  REGISTER: '/register',
}

export { configuration, paths };
