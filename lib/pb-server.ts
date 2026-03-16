import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';

export async function createServerPb() {
  const pb = new PocketBase('https://apibetonabi.vmst.com.vn/');
  pb.autoCancellation(false);
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('pb_auth')?.value;
  if (authCookie) {
    try {
      pb.authStore.loadFromCookie(`pb_auth=${authCookie}`);
    } catch { /* ignore invalid cookie */ }
  }
  return pb;
}
