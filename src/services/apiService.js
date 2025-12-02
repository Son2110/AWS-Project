import API_CONFIG from "../api-config";

const apiService = {
  // Helper to get auth token - API Gateway Cognito Authorizer requires id_token
  getAuthToken: () => {
    return localStorage.getItem("id_token");
  },

  // Auth APIs
  login: async (username, password, companyName) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password, companyName }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = "Invalid email or password.";
        if (data.body) {
          const errorBody = JSON.parse(data.body);
          errorMessage = errorBody.message || errorMessage;
        } else if (data.message) {
          errorMessage = data.message;
        }
        throw new Error(errorMessage);
      }

      return data.body ? JSON.parse(data.body) : data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  logout: async (accessToken, idToken) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGOUT}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            access_token: accessToken,
          }),
        }
      );

      if (!response.ok) {
        console.warn("Logout API failed, but continuing with local logout");
      }

      return true;
    } catch (error) {
      console.warn("Logout API call failed:", error.message);
      return true;
    }
  },

  signup: async (formData) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SIGNUP}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      return data;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  },

  verifySignup: async (email, code, companyName) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VERIFY_SIGNUP}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, code, companyName }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }

      return data;
    } catch (error) {
      console.error("Verification error:", error);
      throw error;
    }
  },

  resendCode: async (email) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESEND_CODE}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend code");
      }

      return data;
    } catch (error) {
      console.error("Resend code error:", error);
      throw error;
    }
  },

  forgotPassword: async (username) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FORGOT_PASSWORD}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
        }
      );

      const responseText = await response.text();
      const data = responseText ? JSON.parse(responseText) : {};

      if (!response.ok) {
        throw new Error(data.message || "Failed to send verification code");
      }

      return data;
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error;
    }
  },

  confirmForgotPassword: async (username, code, new_password) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONFIRM_FORGOT_PASSWORD}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, code, new_password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Password reset failed");
      }

      return data;
    } catch (error) {
      console.error("Confirm forgot password error:", error);
      throw error;
    }
  },

  changeTemporaryPassword: async (username, newPassword, session) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHANGE_TEMPORARY_PASSWORD}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, newPassword, session }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      return data;
    } catch (error) {
      console.error("Change temporary password error:", error);
      throw error;
    }
  },

  // Admin APIs
  createOfficeWithManager: async (officeData) => {
    try {
      const token = apiService.getAuthToken();
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_OFFICE_WITH_MANAGER}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(officeData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create office with manager");
      }

      return data;
    } catch (error) {
      console.error("Error creating office with manager:", error);
      throw error;
    }
  },

  listOffices: async (orgAlias) => {
    try {
      const token = apiService.getAuthToken();
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${
          API_CONFIG.ENDPOINTS.LIST_OFFICE_AND_MANAGER
        }?orgAlias=${encodeURIComponent(orgAlias)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch offices");
      }

      // Handle both wrapped and direct response formats
      const result = data.body ? JSON.parse(data.body) : data;
      return result.offices || [];
    } catch (error) {
      console.error("Error listing offices:", error);
      throw error;
    }
  },

  getOfficeDetail: async (orgAlias, officeId) => {
    try {
      const token = apiService.getAuthToken();
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${
          API_CONFIG.ENDPOINTS.OFFICE_DETAIL
        }?orgAlias=${encodeURIComponent(
          orgAlias
        )}&officeId=${encodeURIComponent(officeId)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch office detail");
      }

      // Handle both wrapped and direct response formats
      const result = data.body ? JSON.parse(data.body) : data;
      return result.office || null;
    } catch (error) {
      console.error("Error getting office detail:", error);
      throw error;
    }
  },

  updateOfficeOrManager: async (target, orgAlias, id, updates) => {
    try {
      const token = apiService.getAuthToken();
      const body = {
        target: target, // "OFFICE" or "MANAGER"
        orgAlias: orgAlias,
        updates: updates,
      };

      // Add appropriate ID field based on target
      if (target === "OFFICE") {
        body.officeId = id;
      } else if (target === "MANAGER") {
        body.userId = id;
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_OFFICE_AND_MANAGER}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update");
      }

      // Handle both wrapped and direct response formats
      const result = data.body ? JSON.parse(data.body) : data;
      return result;
    } catch (error) {
      console.error("Error updating:", error);
      throw error;
    }
  },

  deleteOfficeOrManager: async (
    action,
    orgAlias,
    id,
    deleteManager = false
  ) => {
    try {
      const token = apiService.getAuthToken();
      const body = {
        action: action, // "DELETE_OFFICE" or "DELETE_MANAGER"
        orgAlias: orgAlias,
      };

      // Add appropriate ID field and deleteManager option
      if (action === "DELETE_OFFICE") {
        body.officeId = id;
        body.deleteManager = deleteManager;
      } else if (action === "DELETE_MANAGER") {
        body.userId = id;
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DELETE_OFFICE_AND_MANAGER}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete");
      }

      // Handle both wrapped and direct response formats
      const result = data.body ? JSON.parse(data.body) : data;
      return result;
    } catch (error) {
      console.error("Error deleting:", error);
      throw error;
    }
  },

  // User APIs
  updateProfile: async (profileData) => {
    try {
      const token = apiService.getAuthToken();
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE_UPDATE}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profileData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      return data;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  // Room APIs
  getRooms: async () => {
    try {
      const token = apiService.getAuthToken();
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ROOMS}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching rooms:", error);
      throw error;
    }
  },

  getRoomsByOffice: async (officeId) => {
    try {
      const token = apiService.getAuthToken();
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ROOMS}?officeId=${officeId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching rooms by office:", error);
      throw error;
    }
  },

  getRoomConfig: async (roomId, officeId) => {
    try {
      const token = apiService.getAuthToken();
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ROOM_CONFIG}?roomId=${roomId}&officeId=${officeId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching room config:", error);
      throw error;
    }
  },

  getSensorData: async (roomId, limit = 50) => {
    try {
      const token = apiService.getAuthToken();
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SENSOR_DATA}?roomId=${roomId}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching sensor data:", error);
      throw error;
    }
  },

  updateRoomConfig: async (roomId, officeId, updates) => {
    try {
      const token = apiService.getAuthToken();
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ROOM_CONFIG}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            roomId,
            officeId,
            updates,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update room config");
      }

      return data;
    } catch (error) {
      console.error("Error updating room config:", error);
      throw error;
    }
  },

  createRoomConfig: async (roomData) => {
    try {
      const token = apiService.getAuthToken();
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_ROOM_CONFIG}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(roomData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create room config");
      }

      return data;
    } catch (error) {
      console.error("Error creating room config:", error);
      throw error;
    }
  },

  // Logs APIs
  getLogs: async (filters = {}) => {
    try {
      const token = apiService.getAuthToken();
      const queryParams = new URLSearchParams(filters).toString();
      const url = queryParams
        ? `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGS}?${queryParams}`
        : `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGS}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching logs:", error);
      throw error;
    }
  },
};

export default apiService;
