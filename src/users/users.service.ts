import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from '../db/db.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
    constructor(
        @Inject(DRIZZLE)
        private db: NodePgDatabase<typeof schema>,
    ) { }

    async findByEmail(email: string) {
        const results = await this.db
            .select()
            .from(schema.users)
            .where(eq(schema.users.email, email))
            .limit(1);
        return results[0];
    }

    async create(user: typeof schema.users.$inferInsert) {
        const results = await this.db
            .insert(schema.users)
            .values(user)
            .returning();
        return results[0];
    }

    async findById(id: number) {
        const results = await this.db
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, id))
            .limit(1);
        return results[0];
    }
}
