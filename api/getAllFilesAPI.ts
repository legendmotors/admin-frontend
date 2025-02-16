import { api } from "./api";

// Define the type for the response data
interface File {
  id: string; // Replace with the actual properties of the file object
  name: string; // Example field
  // Add more fields as required
}

interface GetAllFilesResponse {
  success: boolean;
  data: File[];
  totalRecords: number;
  totalPages: number;
}

// Define function with proper typing
export const getAllFilesAPI = async (
  search: string = "",
  page: number = 1,
  limit: number = 10
): Promise<GetAllFilesResponse> => {
  try {
    // Dynamically build the params object
    const params: { [key: string]: any } = { page, limit };
    if (search) {
      params.search = search; // Add search only if it has a value
    }

    const response = await api.get<GetAllFilesResponse>("/", { params });

    return response.data; // ✅ Only return actual data
  } catch (error) {
    console.error("❌ Error fetching files:", error);
    return { success: false, data: [], totalRecords: 0, totalPages: 0 }; // ✅ Safe fallback
  }
};
