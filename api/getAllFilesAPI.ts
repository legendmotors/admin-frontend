import { api } from "./api";

// Define the response structure
interface GetFilesResponse {
  success: boolean;
  data: any[]; // Adjust type if you have a proper FileItem type
  pagination: {
    currentPage: number;
    totalPages: number;
  };
}

export const getAllFilesAPI = async (
  search: string = "",
  page: number = 1,
  limit: number = 10
): Promise<GetFilesResponse> => {
  try {
    // Prepare parameters, excluding search if it's empty
    const params: any = { page, limit };
    if (search) {
      params.search = search;
    }

    // Make the request with the constructed params
    const response = await api.get("/", { params });

    return {
      success: response.data.success,
      data: response.data.data || [],
      pagination: {
        currentPage: page, // ✅ Wrap in `pagination`
        totalPages: response.data.totalPages || 1,
      },
    };
  } catch (error) {
    console.error("❌ Error fetching files:", error);
    return {
      success: false,
      data: [],
      pagination: { currentPage: 1, totalPages: 1 }, // ✅ Ensure pagination exists
    };
  }
};
