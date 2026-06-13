import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { downloads } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const historyRouter = router({
  // Salva um download no histórico
  save: publicProcedure
    .input(
      z.object({
        sessionId: z.string().min(1),
        url: z.string().url(),
        title: z.string().optional(),
        thumbnail: z.string().optional(),
        platform: z.string().optional(),
        format: z.string().optional(),
        duration: z.number().optional(),
        status: z.enum(["pending", "completed", "error"]).default("completed"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      await db.insert(downloads).values({
        sessionId: input.sessionId,
        url: input.url,
        title: input.title ?? null,
        thumbnail: input.thumbnail ?? null,
        platform: input.platform ?? null,
        format: input.format ?? null,
        duration: input.duration ?? null,
        status: input.status,
      });

      return { success: true };
    }),

  // Lista os últimos 20 downloads de uma sessão
  list: publicProcedure
    .input(z.object({ sessionId: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const rows = await db
        .select()
        .from(downloads)
        .where(eq(downloads.sessionId, input.sessionId))
        .orderBy(desc(downloads.createdAt))
        .limit(20);

      return rows;
    }),

  // Remove um item do histórico
  remove: publicProcedure
    .input(z.object({ id: z.number(), sessionId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      const { and } = await import("drizzle-orm");
      await db
        .delete(downloads)
        .where(and(eq(downloads.id, input.id), eq(downloads.sessionId, input.sessionId)));

      return { success: true };
    }),
});
