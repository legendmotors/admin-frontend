import { api } from "./api";

interface RenameResponse {
  // Define the expected structure of the response object here
  // Example:
  success: boolean;
  message: string;
}

export const renameAPI = async (id: string, newName: string): Promise<RenameResponse> => {
  const response = await api.patch<RenameResponse>("/rename", {
    id,
    newName,
  });
  return response.data;
};
