import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import 'dotenv/config';

const pool = new Pool({
    connectionString: `postgresql://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`,
});

const db = drizzle(pool, { schema });

async function seed() {
    console.log('🌱 Full Migration: Migrating hardcoded topics to DB...');

    await db.delete(schema.specContents);
    await db.delete(schema.categories);

    const categoriesData = [
        {
            name: 'Backend Core',
            items: [
                { name: '스프링', icon: 'Leaf', color: 'text-green-600', bg: 'bg-green-50', techType: 'backend' },
                { name: '스프링 시큐리티', icon: 'ShieldCheck', color: 'text-blue-600', bg: 'bg-blue-50', techType: 'backend-security' },
                { name: '스프링 배치', icon: 'Repeat', color: 'text-orange-600', bg: 'bg-orange-50', techType: 'backend-batch' },
            ]
        },
        {
            name: 'Frontend Core',
            items: [
                { name: '리액트', icon: 'Code2', color: 'text-cyan-600', bg: 'bg-cyan-50', techType: 'frontend' },
                { name: 'Next.js', icon: 'Globe', color: 'text-zinc-900', bg: 'bg-zinc-100', techType: 'nextjs' },
                { name: 'State Management', icon: 'Workflow', color: 'text-blue-500', bg: 'bg-blue-50', techType: 'state' },
            ]
        },
        {
            name: '파일럿 프로젝트',
            items: [
                { name: 'pilot(front)', icon: 'Rocket', color: 'text-blue-600', bg: 'bg-blue-50', techType: 'pilot(front)' },
                { name: 'pilot(backend)', icon: 'Settings', color: 'text-zinc-700', bg: 'bg-zinc-100', techType: 'pilot(backend)' },
                { name: 'pilot(ai)', icon: 'Sparkles', color: 'text-amber-500', bg: 'bg-amber-50', techType: 'pilot(ai)' },
            ]
        }
    ];

    for (const [catIdx, cat] of categoriesData.entries()) {
        const root = await db.insert(schema.categories).values({
            name: cat.name,
            depth: 0,
            displayOrder: catIdx,
            categoryType: 'TOPIC',
        }).returning();

        for (const [itemIdx, item] of cat.items.entries()) {
            const tech = await db.insert(schema.categories).values({
                name: item.name,
                parentId: root[0].id,
                depth: 1,
                displayOrder: itemIdx,
                categoryType: 'TOPIC',
                techType: item.techType || item.name,
                icon: item.icon,
                color: item.color,
                bg: item.bg,
            }).returning();

            // Add some dummy content/notes for Spring and Pilot AI
            if (item.name === '스프링') {
                const sub = await db.insert(schema.categories).values({
                    name: '의존성 주입 심화',
                    parentId: tech[0].id,
                    depth: 2,
                    displayOrder: 1,
                    categoryType: 'NOTE',
                    techType: item.techType,
                }).returning();

                await db.insert(schema.specContents).values({
                    categoryId: sub[0].id,
                    title: 'Constructor Injection이 권장되는 이유',
                    content: '### DI Analysis\n1. Immutable\n2. Pure Unit Testing\n3. Final keyword support',
                });
            }

            if (item.name === 'pilot(ai)') {
                const sub = await db.insert(schema.categories).values({
                    name: '프롬프트 설계 전략',
                    parentId: tech[0].id,
                    depth: 2,
                    displayOrder: 1,
                    categoryType: 'NOTE',
                    techType: item.techType,
                }).returning();

                await db.insert(schema.specContents).values({
                    categoryId: sub[0].id,
                    title: 'Few-shot Prompting 가이드',
                    content: '### Few-shot 예시를 통해 응답의 일관성을 높이세요.',
                });
            }
        }
    }

    console.log('✅ Re-seeding completed successfully!');
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
