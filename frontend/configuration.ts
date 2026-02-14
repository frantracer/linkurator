const WEB_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://www.linkurator.com';
const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:9000' : 'https://api.linkurator.com';
const SUBSCRIPTIONS_URL = `${API_BASE_URL}/subscriptions/`;
const TOPICS_URL = `${API_BASE_URL}/topics/`;
const ITEMS_URL = `${API_BASE_URL}/items/`;
const PROFILE_URL = `${API_BASE_URL}/profile/`;
const WEB_HOME_URL = `${WEB_BASE_URL}/home/`;
const WEB_LOGIN_URL = `${WEB_BASE_URL}/login/`;
const CURATORS_URL = `${API_BASE_URL}/curators/`;
const PROVIDERS_URL = `${API_BASE_URL}/providers/`;
const LOGIN_URL = `${API_BASE_URL}/login/?redirect_uri=${encodeURI(WEB_HOME_URL)}`;
const LOGOUT_URL = `${API_BASE_URL}/logout/?redirect_uri=${encodeURI(WEB_LOGIN_URL)}`;
const LOGIN_EMAIL_URL = `${API_BASE_URL}/login_email`;
const REGISTER_URL = `${API_BASE_URL}/register/?redirect_uri=${encodeURI(WEB_HOME_URL)}`;
const SUBSCRIPTIONS_WEB_URL = `${WEB_BASE_URL}/subscriptions`;
const SUBSCRIPTIONS_YOUTUBE_IMPORT_URL = `${API_BASE_URL}/subscriptions/sync/youtube?redirect_uri=${encodeURI(SUBSCRIPTIONS_WEB_URL)}`;
const SUBSCRIPTIONS_PATREON_IMPORT_URL = `${API_BASE_URL}/subscriptions/sync/patreon?redirect_uri=${encodeURI(SUBSCRIPTIONS_WEB_URL)}`;

const TERMS_OF_SERVICE_URL = `${WEB_BASE_URL}/tos`;
const PRIVACY_POLICY_URL = `${WEB_BASE_URL}/privacy`;
const REGISTER_VALIDATE_BASE_URL = `${WEB_BASE_URL}/register/validate`;
const FORGOT_PASSWORD_BASE_URL = `${WEB_BASE_URL}/login/forgot-password`;
const CHATS_URL = `${API_BASE_URL}/chats`;

const configuration = {
  SUBSCRIPTIONS_URL,
  SUBSCRIPTIONS_YOUTUBE_IMPORT_URL,
  SUBSCRIPTIONS_PATREON_IMPORT_URL,
  PROFILE_URL,
  LOGIN_URL,
  LOGIN_EMAIL_URL,
  LOGOUT_URL,
  REGISTER_URL,
  REGISTER_EMAIL_URL: `${API_BASE_URL}/register_email/`,
  VALIDATE_EMAIL_URL: `${API_BASE_URL}/validate_email/`,
  FORGOT_PASSWORD_URL: `${API_BASE_URL}/change_password/`,
  USER_FILTER_URL: `${API_BASE_URL}/filters/`,
  TOPICS_URL,
  ITEMS_URL,
  CURATORS_URL,
  PROVIDERS_URL,
  API_BASE_URL,
  TERMS_OF_SERVICE_URL,
  PRIVACY_POLICY_URL,
  EXAMPLE_GEOPOLITICS_TOPIC_URL: `${WEB_BASE_URL}/topics/8b281f83-c3b0-4846-866b-a1521ed39670`,
  EXAMPLE_VIDEO_GAMES_NEWS_TOPIC_URL: `${WEB_BASE_URL}/topics/ffd2f348-6e99-413b-be75-0f7b01ea9b01`,
  REGISTER_VALIDATE_BASE_URL,
  FORGOT_PASSWORD_BASE_URL,
  CHATS_URL
};

const paths = {
  LANDING: '/',
  HOME: '/home',
  LOGIN: '/login',
  LOGOUT: '/logout',
  TOPICS: '/topics',
  SUBSCRIPTIONS: '/subscriptions',
  PROFILE: '/profile',
  REGISTER: '/register',
  CURATORS: '/curators',
  CHATS: '/chats',
  SETTINGS: '/settings',
  FORGOT_PASSWORD: '/login/forgot-password',
  REGISTER_EMAIL_SENT: '/register/email-sent',
  REGISTER_VALIDATE: '/register/validate',
}

export { configuration, paths };
