import { describe, expect, it, vi } from "vitest";

// Mock do child_process para não executar yt-dlp nos testes
vi.mock("child_process", () => ({
  exec: vi.fn(),
}));
vi.mock("util", () => ({
  promisify: (fn: unknown) => fn,
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

describe("download.getInfo", () => {
  it("lança erro BAD_REQUEST para URL inválida", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.download.getInfo({ url: "nao-e-uma-url" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("download.getDownloadLink", () => {
  it("lança erro BAD_REQUEST para URL inválida", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.download.getDownloadLink({ url: "invalida", format: "mp4-best" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
