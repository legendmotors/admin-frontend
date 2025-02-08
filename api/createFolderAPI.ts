import { api } from "./api";

interface FolderResponse {
  id: string;
  name: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

interface FolderError {
  error: string;
}

export const createFolderAPI = async (
  name: string,
  parentId?: string
): Promise<FolderResponse | FolderError> => {
  try {
    console.log("📂 Creating Folder:", { name, parentId }); // ✅ Debugging log

    const response = await api.post<FolderResponse>("/folder", { name, parentId });

    console.log("✅ Folder Created Successfully:", response.data); // ✅ Success log

    return response.data; // ✅ Return only the data, not the full response object
  } catch (error: any) {
    console.error("❌ Error Creating Folder:", error.response?.data || error.message);
    
    return { error: error.response?.data || "Server Error" }; // ✅ Return a clean error message
  }
};