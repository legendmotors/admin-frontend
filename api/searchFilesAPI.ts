import axios from "axios";

export const searchFilesAPI = async (query: string): Promise<any[]> => {
  try {
    const response = await axios.get(`/api/file-system/search?query=${encodeURIComponent(query)}`);
    return response.data.data as any[]; // Replace `any[]` with the actual file type if available
  } catch (error) {
    console.error("❌ Search API Error:", error);
    return [];
  }
};
