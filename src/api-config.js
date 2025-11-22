// API Gateway Configuration
const API_CONFIG = {
  // TODO: Thay bằng Invoke URL của API Gateway (không có trailing slash)
  BASE_URL: "https://abc123xyz.execute-api.ap-southeast-1.amazonaws.com/prod",

  ENDPOINTS: {
    ROOMS: "/rooms",
    LOGS: "/logs",
  },
};

export default API_CONFIG;
