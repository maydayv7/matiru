import { API_BASE } from "../config";

const request = async (endpoint, options = {}) => {
  const { body, token, ...customConfig } = options;

  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const config = {
    method: body ? "POST" : "GET",
    ...customConfig,
    headers: { ...headers, ...customConfig.headers },
  };
  if (body) config.body = JSON.stringify(body);

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "An API error occurred");
  return data;
};

const uploadImage = (formData, token) => {
  return fetch(`${API_BASE}/uploadImage`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Image upload failed");
    return data;
  });
};

export const api = {
  login: (credentials) => request("/auth/login", { body: credentials }),
  uploadImage,
  getNotifications: (token) => request("/notifications", { token }),
  registerProduce: (data, token) =>
    request("/registerProduce", { body: data, token }),
  updateLocation: (data, token) =>
    request("/updateLocation", { body: data, token }),
  transferOwnership: (data, token) =>
    request("/transferOwnership", { body: data, token }),
  inspectProduce: (data, token) =>
    request("/inspectProduce", { body: data, token }),
  updateDetails: (data, token) =>
    request("/updateDetails", { body: data, token }),
  markAsUnavailable: (data, token) =>
    request("/markAsUnavailable", { body: data, token }),
  splitProduce: (data, token) =>
    request("/splitProduce", { body: data, token }),
  getProduceById: (id) => request(`/getProduce/${id}`),
  getProduceByOwner: (ownerId) => request(`/getProduceByOwner/${ownerId}`),
  getUserDetails: (userKey) => request(`/getUser/${userKey}`),
};
