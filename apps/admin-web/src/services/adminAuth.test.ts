import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getAdminCaptcha,
  getAdminPermMenu,
  getAdminProfile,
  loginAdmin,
} from "./adminAuth";

describe("admin auth services", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("loads captcha tickets from the backend open endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        code: 1000,
        data: {
          captchaId: "captcha-1",
          data: "data:image/svg+xml;base64,abc",
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await getAdminCaptcha();

    expect(result).toEqual({
      captchaId: "captcha-1",
      data: "data:image/svg+xml;base64,abc",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/base/open/captcha?color=%230f172a",
      expect.objectContaining({
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
  });

  it("posts login credentials and returns the issued token pair", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        code: 1000,
        data: {
          token: "token-1",
          refreshToken: "refresh-1",
          expire: 7200,
          refreshExpire: 1296000,
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await loginAdmin({
      username: "admin",
      password: "123456",
      captchaId: "captcha-1",
      verifyCode: "abcd",
    });

    expect(result.token).toBe("token-1");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0];
    expect(init?.method).toBe("POST");
    expect(String(init?.body)).toContain('"username":"admin"');
    expect(String(init?.body)).toContain('"verifyCode":"abcd"');
  });

  it("uses the raw admin token when loading profile and permission menus", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 1000,
          data: {
            id: 1,
            username: "admin",
            nickName: "管理员",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 1000,
          data: {
            perms: ["app:valuationOrder:page"],
            menus: [
              {
                id: 78,
                parentId: 77,
                name: "报废预约单",
                router: "/app/valuation-order",
                type: 1,
                icon: "icon-order",
                orderNum: 1,
                viewPath: "modules/app/views/valuation-order/index.vue",
                keepAlive: true,
                isShow: true,
              },
            ],
          },
        }),
      });

    vi.stubGlobal("fetch", fetchMock);

    await getAdminProfile("token-1");
    const menus = await getAdminPermMenu("token-1");

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/admin/base/comm/person",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "token-1",
        }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/admin/base/comm/permmenu",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "token-1",
        }),
      }),
    );
    expect(menus.menus).toHaveLength(1);
  });
});
