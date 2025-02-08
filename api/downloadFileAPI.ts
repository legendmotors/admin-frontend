interface File {
  id: string; // Adjust type as needed (could be string or number depending on your file ID structure)
}

export const downloadFile = async (files: File[]): Promise<void> => {
  if (files.length === 0) return;

  try {
    const fileQuery = files.map((file) => `files=${encodeURIComponent(file.id)}`).join("&");
    const url = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/download?${fileQuery}`;

    const link = document.createElement("a");
    link.href = url;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error: unknown) {
    console.error(error); // Log the error for debugging
    return; // Optional: you can return a default value here if needed
  }
};
