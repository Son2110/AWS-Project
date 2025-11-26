const apiService = {
  getAuthHeader: async () => {
    try {
      return {
        "Content-Type": "application/json",
      };
    } catch (error) {
      console.error("Error getting auth token:", error);
      throw error;
    }
  },

  getUserOffice: async (userId) => {
    try {
      const idToken = localStorage.getItem("id_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/user-office?userId=${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching user office:", error);
      throw error;
    }
  },

  getRoomsByOffice: async (officeId) => {
    try {
      const idToken = localStorage.getItem("id_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/rooms?officeId=${officeId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
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

  getUsers: async (companyId) => {
    try {
      const idToken = localStorage.getItem("id_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/user-list?companyId=${companyId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  getRoomConfig: async (officeId, roomId) => {
    try {
      const idToken = localStorage.getItem("id_token");
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/room-config?officeId=${officeId}&roomId=${roomId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
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

  saveRoomConfig: async (officeId, roomId, updates) => {
    try {
      const idToken = localStorage.getItem("id_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/room-config`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            officeId,
            roomId,
            updates,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || errorData.message || "Failed to save room config"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error saving room config:", error);
      throw error;
    }
  },

  updateUserProfile: async (userId, updates) => {
    try {
      const idToken = localStorage.getItem("id_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/profile-update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            userId,
            updates,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.body || "Failed to update profile");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  logout: async (accessToken) => {
    try {
      const idToken = localStorage.getItem("id_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/logout`,
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
        throw new Error("Logout failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  },
};

export default apiService;
