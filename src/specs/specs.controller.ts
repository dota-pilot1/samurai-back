import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Delete, Query } from '@nestjs/common';
import { SpecsService } from './specs.service';

@Controller('specs')
export class SpecsController {
    constructor(private readonly specsService: SpecsService) { }

    @Get('tree')
    async getTree(@Query('tech') tech?: string) {
        return await this.specsService.getTree(tech);
    }

    @Get('subjects')
    async getSubjects() {
        return await this.specsService.getSubjects();
    }

    @Get('contents/:categoryId')
    async getContents(@Param('categoryId', ParseIntPipe) categoryId: number) {
        return await this.specsService.getContentsByCategory(categoryId);
    }

    @Post('categories')
    async createCategory(@Body() data: any) {
        return await this.specsService.createCategory(data);
    }

    @Post('contents')
    async createContent(@Body() data: any) {
        return await this.specsService.createContent(data);
    }

    @Patch('categories/:id')
    async updateCategory(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
        return await this.specsService.updateCategory(id, data);
    }

    @Delete('categories/:id')
    async deleteCategory(@Param('id', ParseIntPipe) id: number) {
        return await this.specsService.deleteCategory(id);
    }

    @Patch('contents/:id')
    async updateContent(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
        return await this.specsService.updateContent(id, data);
    }

    @Delete('contents/:id')
    async deleteContent(@Param('id', ParseIntPipe) id: number) {
        return await this.specsService.deleteContent(id);
    }
}
