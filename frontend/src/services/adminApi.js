import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/admin/`;

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("access")}`,
  },
});

export const fetchAdminDashboard = () =>
  axios.get(`${BASE_URL}dashboard/`, getAuthHeaders());

export const fetchAllComplaints = () =>
  axios.get(`${BASE_URL}complaints/`, getAuthHeaders());
