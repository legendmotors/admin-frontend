import { api } from "./api";

export const deleteAPI = async (ids: number[] | string[]): Promise<any> => {
  const response = await api.delete("/delete", { data: { ids } });
  return response;
};
