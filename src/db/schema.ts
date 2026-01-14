import { pgTable, serial, text, timestamp, varchar, integer, boolean, AnyPgColumn } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: text('password').notNull(),
    name: varchar('name', { length: 100 }),
    role: varchar('role', { length: 20 }).default('user').notNull(), // 'admin', 'user'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    categoryType: varchar('category_type', { length: 50 }).default('TOPIC').notNull(), // 'TOPIC', 'NOTE', 'CHALLENGE', 'FAQ'
    techType: varchar('tech_type', { length: 50 }), // 'frontend', 'backend', 'pilot-ai', etc.
    color: varchar('color', { length: 100 }), // for icons
    bg: varchar('bg', { length: 100 }), // for card backgrounds
    parentId: integer('parent_id').references((): AnyPgColumn => categories.id, { onDelete: 'cascade' }),
    displayOrder: integer('display_order').default(0),
    depth: integer('depth').default(0),
    icon: varchar('icon', { length: 100 }),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const specContents = pgTable('spec_contents', {
    id: serial('id').primaryKey(),
    categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content'), // Markdown or HTML
    itemType: varchar('item_type', { length: 50 }).default('CONCEPT'), // 'CONCEPT' (개념), 'CODE' (코드)
    displayOrder: integer('display_order').default(0),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tickets = pgTable('tickets', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    status: varchar('status', { length: 20 }).default('pending').notNull(), // 'pending', 'in_progress', 'completed'
    ownerId: integer('owner_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
