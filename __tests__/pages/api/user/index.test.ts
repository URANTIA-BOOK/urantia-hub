import type { NextApiRequest, NextApiResponse } from "next";
import getSessionDetails from "@/utils/getSessionDetails";

const mockUserUpdate = vi.fn();

vi.mock("@/utils/getSessionDetails", () => ({
  default: vi.fn(),
}));

vi.mock("@/services/user", () => ({
  default: class MockUserService {
    update = mockUserUpdate;
  },
}));

vi.mock("@/services/account", () => ({ default: class MockService {} }));
vi.mock("@/services/bookmark", () => ({ default: class MockService {} }));
vi.mock("@/services/note", () => ({ default: class MockService {} }));
vi.mock("@/services/session", () => ({ default: class MockService {} }));
vi.mock("@/services/share", () => ({ default: class MockService {} }));

vi.mock("@/middleware/sentry", () => ({
  withSentry: (handler: any) => handler,
}));

function request(body: unknown): NextApiRequest {
  return { method: "PUT", query: {}, headers: {}, body } as NextApiRequest;
}

function response(): NextApiResponse & { statusCode: number; payload: unknown } {
  const res: any = {
    statusCode: 200,
    payload: null,
    status: vi.fn((code: number) => {
      res.statusCode = code;
      return res;
    }),
    json: vi.fn((payload: unknown) => {
      res.payload = payload;
      return res;
    }),
    end: vi.fn(() => res),
    setHeader: vi.fn(),
  };
  return res;
}

const user = { id: "user-1", readingLanguage: null };

describe("pages/api/user", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSessionDetails).mockResolvedValue({ session: {}, user } as any);
  });

  it("persists a valid reading language", async () => {
    const updated = { ...user, readingLanguage: "es" };
    mockUserUpdate.mockResolvedValue(updated);
    const { default: handler } = await import("@/pages/api/user");
    const res = response();

    await handler(request({ readingLanguage: "es" }), res);

    expect(mockUserUpdate).toHaveBeenCalledWith("user-1", {
      readingLanguage: "es",
    });
    expect(res.statusCode).toBe(200);
    expect(res.payload).toEqual(updated);
  });

  it("rejects an invalid reading language without updating the user", async () => {
    const { default: handler } = await import("@/pages/api/user");
    const res = response();

    await handler(request({ readingLanguage: "../../es" }), res);

    expect(mockUserUpdate).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
    expect(res.payload).toEqual({ error: "Invalid readingLanguage" });
  });
});
