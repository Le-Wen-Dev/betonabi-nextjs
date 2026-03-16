import { pb } from "@/lib/pb";

export const CONTACTS_COLLECTION = "contact";

export type ContactRecord = {
  id: string;
  created?: string;
  updated?: string;
  name: string;
  email: string;
  phone?: string;
  tencongty?: string;
  tinnhan?: string;
  phongbanchucvu?: string;
};

function escapePbFilterValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/** Public: create a contact submission (no auth required) */
export async function createContactSubmission(data: {
  name: string;
  company: string;
  department?: string;
  email: string;
  phone?: string;
  message: string;
}) {
  return await pb.collection(CONTACTS_COLLECTION).create<ContactRecord>({
    name: data.name,
    email: data.email,
    phone: data.phone || "",
    tencongty: data.company,
    tinnhan: data.message,
    phongbanchucvu: data.department || "",
  });
}

/** Admin: list contacts with optional search */
export async function listContactSubmissions(params: {
  page: number;
  perPage: number;
  search?: string;
}) {
  const parts: string[] = [];

  if (params.search) {
    const s = escapePbFilterValue(params.search);
    parts.push(`(name ~ "${s}" || email ~ "${s}" || tencongty ~ "${s}" || tinnhan ~ "${s}")`);
  }

  const filter = parts.join(" && ");

  try {
    return await pb
      .collection(CONTACTS_COLLECTION)
      .getList<ContactRecord>(params.page, params.perPage, {
        filter: filter || undefined,
        sort: "-created",
      });
  } catch {
    return await pb
      .collection(CONTACTS_COLLECTION)
      .getList<ContactRecord>(params.page, params.perPage, {
        filter: filter || undefined,
      });
  }
}

/** Admin: delete a single contact */
export async function deleteContactSubmission(id: string) {
  return await pb.collection(CONTACTS_COLLECTION).delete(id);
}

/** Admin: delete multiple contacts */
export async function deleteContactSubmissions(ids: string[]) {
  const results = await Promise.allSettled(
    ids.map((id) => pb.collection(CONTACTS_COLLECTION).delete(id))
  );
  const failed = results.filter((r) => r.status === "rejected").length;
  return { total: ids.length, deleted: ids.length - failed, failed };
}
