import { requestJson } from "./api";

export interface AdminCaptchaTicket {
  captchaId: string;
  data: string;
}

export interface AdminLoginPayload {
  username: string;
  password: string;
  captchaId: string;
  verifyCode: string;
}

export interface AdminLoginResult {
  token: string;
  refreshToken: string;
  expire: number;
  refreshExpire: number;
}

export interface AdminProfile {
  id: number;
  username: string;
  nickName?: string | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface AdminPermMenuItem {
  id: number;
  parentId: number | null;
  name: string;
  router: string | null;
  perms: string | null;
  type: number;
  icon: string | null;
  orderNum: number;
  viewPath: string | null;
  keepAlive: boolean;
  isShow: boolean;
}

export interface AdminPermMenuResult {
  perms: string[];
  menus: AdminPermMenuItem[];
}

function createAdminHeaders(token?: string) {
  if (!token) {
    return undefined;
  }

  return {
    Authorization: token,
  };
}

export async function getAdminCaptcha() {
  return requestJson<AdminCaptchaTicket>(
    "/admin/base/open/captcha?color=%230f172a",
  );
}

export async function loginAdmin(payload: AdminLoginPayload) {
  return requestJson<AdminLoginResult>("/admin/base/open/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAdminProfile(token: string) {
  return requestJson<AdminProfile>("/admin/base/comm/person", {
    headers: createAdminHeaders(token),
  });
}

export async function getAdminPermMenu(token: string) {
  return requestJson<AdminPermMenuResult>("/admin/base/comm/permmenu", {
    headers: createAdminHeaders(token),
  });
}

export async function logoutAdmin(token: string) {
  return requestJson<void>("/admin/base/comm/logout", {
    method: "POST",
    headers: createAdminHeaders(token),
  });
}
