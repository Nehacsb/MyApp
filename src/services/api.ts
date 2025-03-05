import axios from "axios";

const API_URL = "http://103.118.50.123:5000"; // Replace with your local IP

export const fetchData = async () => {
  try {
    const response = await axios.get(`${API_URL}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};
