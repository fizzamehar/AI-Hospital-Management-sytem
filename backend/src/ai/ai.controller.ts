import { Controller, Post, Body, Get, Delete, UseGuards, Request } from '@nestjs/common';
import { ChatbotService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('chatbot')
export class ChatbotController {
  constructor(private service: ChatbotService) {}

  @UseGuards(JwtAuthGuard)
  @Post('chat')
  async chat(@Request() req: any, @Body() body: { message: string }) {
    return this.service.chat(req.user.id, body.message);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getHistory(@Request() req: any) {
    return this.service.getHistory(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('history')
  async clearHistory(@Request() req: any) {
    return this.service.clearHistory(req.user.id);
  }

  // Admin: view all chats
  @UseGuards(JwtAuthGuard)
  @Get('all')
  async getAllChats() {
    return this.service.getAllChats();
  }
}
