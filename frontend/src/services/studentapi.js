import axios from "axios";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;
const MEDIA_BASE = import.meta.env.VITE_API_URL;

export const getStudentDashboard = async () => {
  const token = localStorage.getItem("access_token");

  const response = await axios.get(
    `${API_BASE}/students/dashboard/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = response.data;

  // ✅ Convert relative image path to full URL
  if (data.profile && data.profile.profile_picture) {
    data.profile.profile_picture =
      MEDIA_BASE + data.profile.profile_picture;
  }

  return data;
};
