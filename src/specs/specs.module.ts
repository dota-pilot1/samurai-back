import { Module } from '@nestjs/common';
import { SpecsService } from './specs.service';
import { SpecsController } from './specs.controller';

@Module({
  providers: [SpecsService],
  controllers: [SpecsController]
})
export class SpecsModule {}
