import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, smallint, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// 1. Core Authentication
export const usersAuth = pgTable("users_auth", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  emailHash: varchar("email_hash", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// 2. User Profiles / PII
export const userProfiles = pgTable("user_profiles", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => usersAuth.id, { onDelete: "cascade" }).notNull(),
  email: text("email").notNull(), // Encrypted
  firstName: text("first_name"), // Encrypted
  lastName: text("last_name"), // Encrypted
  mobileNumber: text("mobile_number"), // Encrypted
  location: text("location"), // Encrypted
  keyVersion: smallint("key_version").default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// 3. Business & Seller Information
export const userBusinessInfo = pgTable("user_business_info", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => usersAuth.id, { onDelete: "cascade" }).notNull(),
  sellerId: text("seller_id"), // Encrypted
  sellerIdHash: varchar("seller_id_hash", { length: 255 }),
  businessName: varchar("business_name", { length: 100 }),
  businessInterests: text("business_interests").array(),
  sellerSyncStatus: varchar("seller_sync_status", { length: 20 }),
  onboardingGoal: varchar("onboarding_goal", { length: 100 }),
  onboardingMarketplace: varchar("onboarding_marketplace", { length: 100 }),
  onboardingDetails: varchar("onboarding_details", { length: 500 }),
  keyVersion: smallint("key_version").default(1),
});

// 4. Subscriptions & Quotas
export const userSubscriptions = pgTable("user_subscriptions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => usersAuth.id, { onDelete: "cascade" }).notNull(),
  subscriptionTier: varchar("subscription_tier", { length: 20 }).default("free"),
  subscriptionExpiresAt: timestamp("subscription_expires_at", { withTimezone: true }),
  scheduledDowngradeTo: varchar("scheduled_downgrade_to", { length: 50 }),
  kiCycleStart: timestamp("ki_cycle_start", { withTimezone: true }),
  aiChatUsed: integer("ai_chat_used").default(0),
  aiChatMonth: varchar("ai_chat_month", { length: 7 }),
  analysisUsed: integer("analysis_used").default(0),
  analysisMonth: varchar("analysis_month", { length: 7 }),
  sovUsed: integer("sov_used").default(0),
  sovMonth: varchar("sov_month", { length: 7 }),
  keywordTrackerUsed: integer("keyword_tracker_used").default(0),
  keywordTrackerMonth: varchar("keyword_tracker_month", { length: 7 }),
  kiSearchesUsed: integer("ki_searches_used").default(0),
});

// 5. Application State
export const userAppState = pgTable("user_app_state", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => usersAuth.id, { onDelete: "cascade" }).notNull(),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  explorerTourCompleted: boolean("explorer_tour_completed").default(false),
  sellerTourCompleted: boolean("seller_tour_completed").default(false),
  welcomeCardDismissed: boolean("welcome_card_dismissed").default(false),
});

// 6. Promo Codes
export const promoCodes = pgTable("promo_codes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).unique().notNull(),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }),
  maxUsesPerUser: integer("max_uses_per_user"),
  marketingChannel: varchar("marketing_channel", { length: 100 }),
  isActive: boolean("is_active").default(true),
  validFrom: timestamp("valid_from", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 7. Financial Records
export const paymentOrders = pgTable("payment_orders", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => usersAuth.id, { onDelete: "set null" }),
  planId: varchar("plan_id", { length: 50 }),
  amount: integer("amount"),
  baseAmount: integer("base_amount"),
  gstAmount: integer("gst_amount"),
  currency: varchar("currency", { length: 10 }),
  razorpayOrderId: varchar("razorpay_order_id", { length: 100 }).unique(),
  razorpayPaymentId: varchar("razorpay_payment_id", { length: 100 }),
  razorpaySignature: varchar("razorpay_signature", { length: 256 }),
  refundId: varchar("refund_id", { length: 100 }),
  status: varchar("status", { length: 20 }),
  invoiceNumber: varchar("invoice_number", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  refundedAt: timestamp("refunded_at", { withTimezone: true }),
  promoCodeId: integer("promo_code_id").references(() => promoCodes.id),
  billingFullName: text("billing_full_name"), // Encrypted
  billingEmail: text("billing_email"), // Encrypted
  billingEmailHash: varchar("billing_email_hash", { length: 255 }),
  billingMobile: text("billing_mobile"), // Encrypted
  billingAddress: text("billing_address"), // Encrypted
  billingCompany: varchar("billing_company", { length: 200 }),
  gstNumber: text("gst_number"), // Encrypted
  keyVersion: smallint("key_version").default(1),
});

// 8. Analytics
export const userBehaviorLogs = pgTable("user_behavior_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => usersAuth.id, { onDelete: "set null" }),
  sessionId: varchar("session_id", { length: 100 }),
  eventType: varchar("event_type", { length: 100 }),
  pagePath: text("page_path"),
  properties: jsonb("properties"),
  ipHash: varchar("ip_hash", { length: 255 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 9. Consent Management
export const userConsents = pgTable("user_consents", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => usersAuth.id, { onDelete: "cascade" }).notNull(),
  consentType: varchar("consent_type", { length: 50 }),
  status: boolean("status"),
  policyVersion: varchar("policy_version", { length: 20 }),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }).defaultNow(),
  withdrawnAt: timestamp("withdrawn_at", { withTimezone: true }),
  ipHash: varchar("ip_hash", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 10. Audit Logs
export const auditLogs = pgTable("audit_logs", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  actorUserId: integer("actor_user_id"),
  action: varchar("action", { length: 100 }),
  resourceType: varchar("resource_type", { length: 100 }),
  resourceId: varchar("resource_id", { length: 100 }),
  ipHash: varchar("ip_hash", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 11. Data Subject Requests
export const dataSubjectRequests = pgTable("data_subject_requests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => usersAuth.id, { onDelete: "cascade" }).notNull(),
  requestType: varchar("request_type", { length: 50 }),
  status: varchar("status", { length: 50 }),
  requestedAt: timestamp("requested_at", { withTimezone: true }).defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  notes: text("notes"),
});

// 12. Deleted User Registry
export const deletedUsers = pgTable("deleted_users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  emailHash: varchar("email_hash", { length: 255 }).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }).defaultNow(),
  deletionReason: varchar("deletion_reason", { length: 100 }),
});

// --- Existing Non-User Tables (Unaffected) ---

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  brand: text("brand").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  competitorPrices: jsonb("competitor_prices").notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).notNull(),
  reviewCount: integer("review_count").notNull(),
  salesVolume: integer("sales_volume").notNull(),
  profitMargin: decimal("profit_margin", { precision: 5, scale: 2 }).notNull(),
  stockLevel: integer("stock_level").notNull(),
  locationData: jsonb("location_data").notNull(),
  launchDate: timestamp("launch_date").notNull(),
  trending: boolean("trending").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id),
  date: timestamp("date").notNull(),
  sales: integer("sales").notNull(),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).notNull(),
  views: integer("views").notNull(),
  conversions: integer("conversions").notNull(),
  location: text("location").notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").references(() => usersAuth.id), // Migrated to int to match new schema
  message: text("message").notNull(),
  response: text("response").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Insert schemas
export const insertUserAuthSchema = createInsertSchema(usersAuth);
export const insertUserProfileSchema = createInsertSchema(userProfiles);
export const insertProductSchema = createInsertSchema(products);
export const insertAnalyticsSchema = createInsertSchema(analytics);
export const insertChatMessageSchema = createInsertSchema(chatMessages);

// Types
export type UserAuth = typeof usersAuth.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Analytics = typeof analytics.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
