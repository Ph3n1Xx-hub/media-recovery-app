import { describe, expect, it, vi } from "vitest";

// Mock do banco de dados para não precisar de conexão real nos testes
vi.mock("../server/db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("history.list", () => {
  it("retorna array vazio quando DB não está disponível", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.history.list({ sessionId: "test-session-123" });
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });
});

describe("history.save", () => {
  it("retorna success false quando DB não está disponível", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.history.save({
      sessionId: "test-session-123",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      title: "Test Video",
      platform: "YouTube",
      format: "mp4-best",
    });
    expect(result).toEqual({ success: false });
  });
});

describe("history.remove", () => {
  it("retorna success false quando DB não está disponível", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.history.remove({ id: 1, sessionId: "test-session-123" });
    expect(result).toEqual({ success: false });
  });
});
