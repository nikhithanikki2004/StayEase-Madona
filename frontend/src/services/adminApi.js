import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api/admin/";

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("access")}`,
  },
});

export const fetchAdminDashboard = () =>
  axios.get(`${BASE_URL}dashboard/`, getAuthHeaders());

export const fetchAllComplaints = () =>
  axios.get(`${BASE_URL}complaints/`, getAuthHeaders());
