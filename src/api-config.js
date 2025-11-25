const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,

  ENDPOINTS: {
    LOGIN: "/login",
    LOGOUT: "/logout",
    PROFILE_UPDATE: "/profile-update",
    ROOMS: "/rooms",
    ROOM_CONFIG: "/room-config",
    USER_OFFICE: "/user-office",
    LOGS: "/logs",
  },
};

export default API_CONFIG;
