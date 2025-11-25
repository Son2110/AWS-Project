import API_CONFIG from "../api-config";

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
      const idToken = localStorage.getItem("idToken");
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/user-office?userId=${userId}`,
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
      const idToken = localStorage.getItem("idToken");
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/rooms?officeId=${officeId}`,
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

  getRooms: async () => {
    try {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            {
              id: "room-1",
              name: "Meeting Room A",
              temperature: 22,
              humidity: 45,
              occupancy: 4,
              maxOccupancy: 8,
              status: "occupied",
            },
            {
              id: "room-2",
              name: "Meeting Room B",
              temperature: 24,
              humidity: 40,
              occupancy: 0,
              maxOccupancy: 6,
              status: "available",
            },
            {
              id: "room-3",
              name: "Server Room",
              temperature: 32,
              humidity: 35,
              occupancy: 1,
              maxOccupancy: 2,
              status: "maintenance",
            },
            {
              id: "room-4",
              name: "Office 1",
              temperature: 23,
              humidity: 42,
              occupancy: 2,
              maxOccupancy: 4,
              status: "occupied",
            },
          ]);
        }, 500);
      });
    } catch (error) {
      console.error("Error fetching rooms:", error);
      throw error;
    }
  },

  getLogs: async () => {
    try {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            {
              id: 1,
              timestamp: new Date().toISOString(),
              user: "Admin User",
              action: "Login",
              details: "User logged in successfully",
              ip: "192.168.1.100",
            },
            {
              id: 2,
              timestamp: new Date(Date.now() - 300000).toISOString(),
              user: "Regular User",
              action: "Room Access",
              details: "Accessed Meeting Room A",
              ip: "192.168.1.101",
            },
          ]);
        }, 300);
      });
    } catch (error) {
      console.error("Error fetching logs:", error);
      throw error;
    }
  },
};

export default apiService;
