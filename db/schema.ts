import { pgTable, text, serial, integer, timestamp, boolean, pgEnum, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Role enum tanımı
export const userRoleEnum = pgEnum('user_role', ['user', 'artist', 'label', 'manager']);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  balance: integer("balance").notNull().default(0),
  isAdmin: boolean("is_admin").default(false),
  role: userRoleEnum("role").notNull().default('user'),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  promotions: many(promotions),
  blogPosts: many(blogPosts),
  balanceLogs: many(balanceLogs),
}));

export const platforms = pgTable("platforms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow()
});

export const packages = pgTable("packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  platformId: integer("platform_id").notNull().references(() => platforms.id),
  price: integer("price").notNull(),
  features: text("features").array(),
  tier: text("tier").notNull().default('basic'),
  createdAt: timestamp("created_at").defaultNow()
});

// İlişki tanımlamaları
export const platformsRelations = relations(platforms, ({ many }) => ({
  packages: many(packages)
}));

export const packagesRelations = relations(packages, ({ one }) => ({
  platform: one(platforms, {
    fields: [packages.platformId],
    references: [platforms.id],
  })
}));

export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  packageId: integer("package_id").notNull().references(() => packages.id),
  status: text("status").notNull().default("pending"),
  contentUrl: text("content_url").notNull(),
  views: integer("views").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const promotionsRelations = relations(promotions, ({ one }) => ({
  user: one(users, {
    fields: [promotions.userId],
    references: [users.id],
  }),
  package: one(packages, {
    fields: [promotions.packageId],
    references: [packages.id],
  }),
}));

export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow()
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  coverImage: text("cover_image"),
  authorId: integer("author_id").notNull().references(() => users.id),
  status: text("status").notNull().default("draft"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const blogPostsRelations = relations(blogPosts, ({ one, many }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
  categories: many(blogPostCategories),
  tags: many(blogPostTags),
}));

export const blogCategories = pgTable("blog_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow()
});

export const blogCategoriesRelations = relations(blogCategories, ({ many }) => ({
  posts: many(blogPostCategories),
}));

export const blogPostCategories = pgTable("blog_post_categories", {
  postId: integer("post_id").notNull().references(() => blogPosts.id),
  categoryId: integer("category_id").notNull().references(() => blogCategories.id)
});

export const blogPostCategoriesRelations = relations(blogPostCategories, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostCategories.postId],
    references: [blogPosts.id],
  }),
  category: one(blogCategories, {
    fields: [blogPostCategories.categoryId],
    references: [blogCategories.id],
  }),
}));

export const blogTags = pgTable("blog_tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow()
});

export const blogTagsRelations = relations(blogTags, ({ many }) => ({
  posts: many(blogPostTags),
}));

export const blogPostTags = pgTable("blog_post_tags", {
  postId: integer("post_id").notNull().references(() => blogPosts.id),
  tagId: integer("tag_id").notNull().references(() => blogTags.id)
});

export const blogPostTagsRelations = relations(blogPostTags, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostTags.postId],
    references: [blogPosts.id],
  }),
  tag: one(blogTags, {
    fields: [blogPostTags.tagId],
    references: [blogTags.id],
  }),
}));

export const balanceLogs = pgTable("balance_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: decimal("amount").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  referenceId: integer("reference_id"),
  referenceType: text("reference_type"),
  createdAt: timestamp("created_at").defaultNow()
});

export const balanceLogsRelations = relations(balanceLogs, ({ one }) => ({
  user: one(users, {
    fields: [balanceLogs.userId],
    references: [users.id],
  }),
}));

// Zod şemaları
export const insertUserSchema = createInsertSchema(users, {
  role: z.enum(['user', 'artist', 'label', 'manager']).default('user'),
  isAdmin: z.boolean().default(false),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export const selectUserSchema = createSelectSchema(users);

export const insertPackageSchema = createInsertSchema(packages, {
  features: z.array(z.string()).optional(),
});
export const selectPackageSchema = createSelectSchema(packages);

export const insertPromotionSchema = createInsertSchema(promotions);
export const selectPromotionSchema = createSelectSchema(promotions);

export const insertContactSchema = createInsertSchema(contactSubmissions);
export const selectContactSchema = createSelectSchema(contactSubmissions);

export const insertBlogPostSchema = createInsertSchema(blogPosts);
export const selectBlogPostSchema = createSelectSchema(blogPosts);

export const insertBlogCategorySchema = createInsertSchema(blogCategories);
export const selectBlogCategorySchema = createSelectSchema(blogCategories);

export const insertBlogTagSchema = createInsertSchema(blogTags);
export const selectBlogTagSchema = createSelectSchema(blogTags);

export const insertPlatformSchema = createInsertSchema(platforms);
export const selectPlatformSchema = createSelectSchema(platforms);

// Type tanımlamaları
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Package = typeof packages.$inferSelect;
export type InsertPackage = typeof packages.$inferInsert;
export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = typeof promotions.$inferInsert;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = typeof contactSubmissions.$inferInsert;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;
export type BlogCategory = typeof blogCategories.$inferSelect;
export type InsertBlogCategory = typeof blogCategories.$inferInsert;
export type BlogTag = typeof blogTags.$inferSelect;
export type InsertBlogTag = typeof blogTags.$inferInsert;
export type Platform = typeof platforms.$inferSelect;
export type InsertPlatform = typeof platforms.$inferInsert;
export type BalanceLog = typeof balanceLogs.$inferSelect;
export type InsertBalanceLog = typeof balanceLogs.$inferInsert;