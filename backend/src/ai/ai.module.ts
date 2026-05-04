import { Module } from '@nestjs/common';
import { ChatbotService } from './ai.service';
import { ChatbotController } from './ai.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ChatbotController],
  providers: [ChatbotService],
})
export class ChatbotModule {}
