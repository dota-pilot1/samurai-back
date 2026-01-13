import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DRIZZLE = 'DRIZZLE';

@Global()
@Module({
    providers: [
        {
            provide: DRIZZLE,
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const user = configService.get<string>('DATABASE_USER');
                const pass = configService.get<string>('DATABASE_PASSWORD');
                const host = configService.get<string>('DATABASE_HOST');
                const port = configService.get<number>('DATABASE_PORT');
                const name = configService.get<string>('DATABASE_NAME');

                const pool = new Pool({
                    connectionString: `postgresql://${user}:${pass}@${host}:${port}/${name}`,
                });
                return drizzle(pool, { schema });
            },
        },
    ],
    exports: [DRIZZLE],
})
export class DbModule { }
