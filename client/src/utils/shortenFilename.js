const shortenFilename = (string, length) => {
  const ext = string.match(/\.([^.]+)$/)?.[0];
  const filename = string.substring(0, string.length - ext.length);

  return filename.length <= length
    ? `${string}`
    : `${filename.substring(0, length)}..${ext ?? ""}`;
};

export default shortenFilename;
