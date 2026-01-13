import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from '../db/db.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class SpecsService {
    constructor(
        @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
    ) { }

    async getSubjects() {
        // Fetch depth 0 (Groups) and depth 1 (Techs) for the matrix grid
        const groups = await this.db.query.categories.findMany({
            where: eq(schema.categories.depth, 0),
            orderBy: (items, { asc }) => [asc(items.displayOrder)],
        });

        const techs = await this.db.query.categories.findMany({
            where: eq(schema.categories.depth, 1),
            orderBy: (items, { asc }) => [asc(items.displayOrder)],
        });

        return groups.map(group => ({
            ...group,
            items: techs.filter(t => t.parentId === group.id)
        }));
    }

    async getTree(techType?: string) {
        // Use raw SQL for Recursive CTE to fetch all descendants efficiently
        // Anchor query: when techType is provided, only select depth 1 nodes (Tech Roots) to prevent duplication
        const filterClause = techType
            ? sql`WHERE tech_type = ${techType} AND depth = 1`
            : sql`WHERE parent_id IS NULL`;

        const query = sql`
            WITH RECURSIVE category_tree AS (
                -- Anchor: 스타팅 포인트 (Depth 1 기술 루트)
                SELECT id, name, category_type, tech_type, parent_id, depth, display_order, icon, is_active
                FROM categories
                ${filterClause}
                UNION ALL
                -- Recursive: 자식 노드들을 끝까지 추적
                SELECT c.id, c.name, c.category_type, c.tech_type, c.parent_id, c.depth, c.display_order, c.icon, c.is_active
                FROM categories c
                JOIN category_tree ct ON c.parent_id = ct.id
            )
            SELECT DISTINCT * FROM category_tree ORDER BY depth, display_order;
        `;

        const result = await this.db.execute(query);
        return this.formatToTree(result.rows);
    }

    private formatToTree(items: any[]) {
        const map = new Map();
        const roots: any[] = [];

        items.forEach(item => {
            map.set(item.id, { ...item, children: [] });
        });

        items.forEach(item => {
            const node = map.get(item.id);
            const parent = item.parent_id ? map.get(item.parent_id) : null;

            if (parent) {
                parent.children.push(node);
            } else {
                // If parent_id is null OR parent is not in our filtered set, it's a root for the view
                roots.push(node);
            }
        });

        return roots;
    }

    async getContentsByCategory(categoryId: number) {
        return await this.db.query.specContents.findMany({
            where: eq(schema.specContents.categoryId, categoryId),
            orderBy: (items, { asc }) => [asc(items.displayOrder)],
        });
    }

    async createCategory(data: any) {
        let finalData = { ...data };

        if (data.parentId) {
            // If parent is provided, set depth = parent.depth + 1
            const parent = await this.db.query.categories.findFirst({
                where: eq(schema.categories.id, data.parentId)
            });
            if (parent) {
                finalData.depth = (parent.depth || 0) + 1;
            }
        } else if (data.techType) {
            // If no parent but techType is present, find the tech root (depth 1)
            let techRoot = await this.db.query.categories.findFirst({
                where: sql`tech_type = ${data.techType} AND depth = 1`
            });

            if (!techRoot) {
                // If no root exists for this tech, create a dedicated Tech Root first
                // This prevents the first user-added topic from accidentally becoming the depth-1 boss
                const group = await this.db.query.categories.findFirst({
                    where: eq(schema.categories.depth, 0)
                });

                const newRoot = await this.db.insert(schema.categories).values({
                    name: data.techType,
                    techType: data.techType,
                    depth: 1,
                    parentId: group?.id || null,
                    categoryType: 'ROOT'
                }).returning();
                techRoot = newRoot[0];
            }

            finalData.parentId = techRoot.id;
            finalData.depth = 2; // Items added via the top button are ALWAYS topics (depth 2)
        } else {
            finalData.depth = 0; // It's a new high-level Group
        }

        return await this.db.insert(schema.categories).values(finalData).returning();
    }

    async createContent(data: any) {
        return await this.db.insert(schema.specContents).values(data).returning();
    }

    async updateCategory(id: number, data: any) {
        return await this.db.update(schema.categories)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(schema.categories.id, id))
            .returning();
    }

    async deleteCategory(id: number) {
        return await this.db.delete(schema.categories)
            .where(eq(schema.categories.id, id))
            .returning();
    }
}
