import { pb } from "@/lib/pb";

// PocketBase collection name (create this collection in PB)
export const SITE_SETTINGS_COLLECTION = "site_settings";
export const SITE_SETTINGS_KEY = "site";

export type SiteSettingsData = {
  key: string;
  site_name?: string;
  about_vi?: string;
  about_jp?: string;
  contact_email?: string;
  contact_zalo?: string;
  address_vi?: string;
  address_jp?: string;
};

export type SiteSettingsRecord = SiteSettingsData & {
  id: string;
  created: string;
  updated: string;
};

function escapePbFilterValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export async function fetchSiteSettings(): Promise<SiteSettingsRecord | null> {
  const keyEsc = escapePbFilterValue(SITE_SETTINGS_KEY);
  const res = await pb
    .collection(SITE_SETTINGS_COLLECTION)
    .getList<SiteSettingsRecord>(1, 1, {
      filter: `key = "${keyEsc}"`,
    });
  return res.items?.[0] ?? null;
}

export async function upsertSiteSettings(
  data: Omit<SiteSettingsData, "key">
): Promise<SiteSettingsRecord> {
  const existing = await fetchSiteSettings();
  const payload: SiteSettingsData = {
    key: SITE_SETTINGS_KEY,
    ...data,
  };

  if (existing) {
    return await pb
      .collection(SITE_SETTINGS_COLLECTION)
      .update<SiteSettingsRecord>(existing.id, payload);
  }

  return await pb
    .collection(SITE_SETTINGS_COLLECTION)
    .create<SiteSettingsRecord>(payload);
}
