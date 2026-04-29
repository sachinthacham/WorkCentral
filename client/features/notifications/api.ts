import { api } from "@/services/api";

export const getNotifications = async () => {
  const res = await api.get("/notifications");

  return res.data?.data ?? res.data;
};

export const markNotificationRead = async (id: string) => {
  const res = await api.patch(`/notifications/${id}/read`);

  return res.data;
};
