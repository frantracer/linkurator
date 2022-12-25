const WEB_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://www.linkurator.com';
const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:9000' : 'https://api.linkurator.com';
const SUBSCRIPTIONS_URL = `${API_BASE_URL}/subscriptions/`;
const TOPICS_URL = `${API_BASE_URL}/topics/`;
const ITEMS_URL = `${API_BASE_URL}/items/`;
const PROFILE_URL = `${API_BASE_URL}/profile/`;
const LOGIN_URL = `${API_BASE_URL}/login/?redirect_uri=${encodeURI(WEB_BASE_URL)}`;
const LOGOUT_URL = `${API_BASE_URL}/logout/?redirect_uri=${encodeURI(WEB_BASE_URL)}`;

const configuration = {
  SUBSCRIPTIONS_URL,
  PROFILE_URL,
  LOGIN_URL,
  LOGOUT_URL,
  TOPICS_URL,
  ITEMS_URL,
};

export default configuration;
