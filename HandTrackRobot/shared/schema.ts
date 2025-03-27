import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const handData = pgTable("hand_data", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  data: jsonb("data").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertHandDataSchema = createInsertSchema(handData).pick({
  data: true,
});

// Validation schema for hand position data
export const handPositionSchema = z.object({
  palmCenter: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }),
  wrist: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }),
  indexTip: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }),
  thumbTip: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }),
  orientation: z.object({
    pitch: z.number(),
    roll: z.number(),
    yaw: z.number(),
  }),
});

// Validation schema for tracking statistics
export const trackingStatsSchema = z.object({
  fps: z.number(),
  detectionTime: z.number(),
  quality: z.string(),
  handsDetected: z.number(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertHandData = z.infer<typeof insertHandDataSchema>;
export type HandData = typeof handData.$inferSelect;
export type HandPosition = z.infer<typeof handPositionSchema>;
export type TrackingStats = z.infer<typeof trackingStatsSchema>;
