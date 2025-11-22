// TODO: Import AWS Amplify when ready for Cognito integration
// import { fetchAuthSession } from "aws-amplify/auth";
import API_CONFIG from "../api-config";

/**
 * Simple API Service for Smart Office
 * Currently uses mock data - TODO: integrate with API Gateway + Cognito JWT tokens
 */
const apiService = {
  /**
   * TODO: Get Authorization header with JWT token from Cognito
   * Currently returns basic headers for mock API calls
   */
  getAuthHeader: async () => {
    try {
      // TODO: Replace with Cognito session
      // const session = await fetchAuthSession();
      // const token = session.tokens?.idToken?.toString();
      // return {
      //   Authorization: token,
      //   "Content-Type": "application/json",
      // };

      // Mock headers for development
      return {
        "Content-Type": "application/json",
        // TODO: Add Authorization header when Cognito is integrated
      };
    } catch (error) {
      console.error("Error getting auth token:", error);
      throw error;
    }
  },

  /**
   * Get all rooms from API Gateway
   * TODO: Replace mock data with real API Gateway call
   */
  getRooms: async () => {
    try {
      // TODO: Uncomment when API Gateway is ready
      // const headers = await apiService.getAuthHeader();
      // const response = await fetch(
      //   `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ROOMS}`,
      //   {
      //     method: "GET",
      //     headers,
      //   }
      // );
      // if (!response.ok) {
      //   throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      // }
      // return await response.json();

      // Mock data for development
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
        }, 500); // Simulate API delay
      });
    } catch (error) {
      console.error("Error fetching rooms:", error);
      throw error;
    }
  },

  /**
   * Get activity logs from API Gateway
   * TODO: Replace mock data with real API Gateway call
   */
  getLogs: async () => {
    try {
      // TODO: Uncomment when API Gateway is ready
      // const headers = await apiService.getAuthHeader();
      // const response = await fetch(
      //   `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGS}`,
      //   {
      //     method: "GET",
      //     headers,
      //   }
      // );
      // if (!response.ok) {
      //   throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      // }
      // return await response.json();

      // Mock logs data for development
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
