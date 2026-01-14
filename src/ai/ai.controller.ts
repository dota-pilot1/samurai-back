import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
export class AIController {
    constructor(private readonly aiService: AIService) { }

    @UseGuards(JwtAuthGuard)
    @Post('generate')
    async generate(@Body() body: { prompt: string; context?: string }) {
        const content = await this.aiService.generateContent(body.prompt, body.context);
        return { content };
    }
}
