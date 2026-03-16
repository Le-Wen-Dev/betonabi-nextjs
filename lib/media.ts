import { pb } from "@/lib/pb";

export const MEDIA_COLLECTION = "media";

export type MediaRecord = {
  id: string;
  created: string;
  updated: string;
  file?: string; // filename
  name?: string;
  collectionId?: string;
};

export type ListMediaParams = {
  page: number;
  perPage: number;
  search?: string;
};

export async function listMedia(params: ListMediaParams) {
  const q = params.search?.trim();
  const filter = q
    ? `file ~ "${q.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
    : undefined;

  return pb
    .collection(MEDIA_COLLECTION)
    .getList<MediaRecord>(params.page, params.perPage, {
      sort: "-created",
      filter: filter || undefined,
    });
}

export async function uploadMedia(
  file: File,
  name?: string
): Promise<MediaRecord> {
  const fd = new FormData();
  fd.set("file", file);
  if (name?.trim()) fd.set("name", name.trim());

  return pb.collection(MEDIA_COLLECTION).create<MediaRecord>(fd);
}

export async function deleteMedia(id: string): Promise<void> {
  await pb.collection(MEDIA_COLLECTION).delete(id);
}
