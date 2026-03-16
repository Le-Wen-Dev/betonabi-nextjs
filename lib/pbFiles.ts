import { pb } from "@/lib/pb";

type FileUrlOptions = {
  thumb?: string;
  download?: boolean;
};

// PocketBase SDK compatibility helper.
// Newer SDK: pb.files.getUrl(record, filename, options)
// Some older SDKs: pb.getFileUrl(record, filename, options)
export function getPbFileUrl(
  record: unknown,
  filename?: string | null,
  options?: FileUrlOptions
) {
  if (!filename) return null;

  // If the filename is already a full URL (e.g. static mock data with external images),
  // or a local absolute path (e.g. /du-bao-thoi-tiet.webp from public/),
  // return it directly – no need to go through PocketBase.
  if (filename.startsWith("http://") || filename.startsWith("https://") || filename.startsWith("/")) {
    return filename;
  }

  const anyPb = pb as unknown as {
    files?: {
      getURL?: (rec: unknown, name: string, opts?: FileUrlOptions) => string;
    };
    getFileUrl?: (rec: unknown, name: string, opts?: FileUrlOptions) => string;
  };

  try {
    if (anyPb.files?.getURL)
      return anyPb.files.getURL(record, filename, options);
    if (anyPb.getFileUrl) return anyPb.getFileUrl(record, filename, options);
  } catch {
    // ignore
  }

  return null;
}
