const sortByCreatedAtDescending = (files) => {
  return files.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Newest first
};

const sortFiles = (items) => {
  const folders = items.filter((file) => file.isDirectory);
  const files = items.filter((file) => !file.isDirectory);

  const sortedFolders = sortByCreatedAtDescending(folders); // Sort folders by createdAt
  const sortedFiles = sortByCreatedAtDescending(files); // Sort files by createdAt

  return [...sortedFolders, ...sortedFiles]; // Maintain folder-file order
};

export default sortFiles;
