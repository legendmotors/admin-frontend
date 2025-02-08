import { api } from "./api";

// Define types for the parameters
interface CopyMoveItemParams {
  sourceIds: string[]; // Adjust this type based on actual data structure (e.g., string[], number[])
  destinationId: string; // Adjust this type as needed
}

export const copyItemAPI = async ({ sourceIds, destinationId }: CopyMoveItemParams) => {
  const response = await api.post("/copy", { sourceIds, destinationId });
  return response;
};

export const moveItemAPI = async ({ sourceIds, destinationId }: CopyMoveItemParams) => {
  const response = await api.put("/move", { sourceIds, destinationId });
  return response;
};
