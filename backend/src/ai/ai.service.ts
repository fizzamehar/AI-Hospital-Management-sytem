import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class ChatbotService {
  constructor(private prisma: PrismaService) {}

  // Send message and get AI response
  async chat(userId: string, message: string) {
    // Save user message
    await this.prisma.chatMessage.create({
      data: {
        userId,
        role: 'user',
        content: message,
      },
    });

    // Get chat history for context
    const history = await this.prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    const messages = [
      {
        role: 'system',
        content: `You are MedCore AI, a friendly and knowledgeable medical assistant chatbot. 
You help patients understand their symptoms, provide general health advice, and guide them on when to see a doctor. 
Always remind users that your advice is not a substitute for professional medical consultation.
Be empathetic, clear, and helpful. Use simple language.`,
      },
      ...history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    try {
      const res = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'openrouter/free',
          messages,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
          },
        },
      );

      const aiReply =
        res.data?.choices?.[0]?.message?.content ||
        'I apologize, I could not process your request. Please try again.';

      // Save AI response
      await this.prisma.chatMessage.create({
        data: {
          userId,
          role: 'assistant',
          content: aiReply,
        },
      });

      return {
        reply: aiReply,
      };
    } catch (error) {
      console.error('AI API Error:', error.response?.data || error.message);
      // Fallback response
      const fallback =
        'I am currently experiencing connectivity issues. Please try again shortly or contact your healthcare provider directly.';

      await this.prisma.chatMessage.create({
        data: {
          userId,
          role: 'assistant',
          content: fallback,
        },
      });

      return { reply: fallback };
    }
  }

  // Get chat history for a user
  async getHistory(userId: string) {
    return this.prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  // Get all chat conversations (admin)
  async getAllChats() {
    return this.prisma.chatMessage.findMany({
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  // Clear chat history
  async clearHistory(userId: string) {
    await this.prisma.chatMessage.deleteMany({
      where: { userId },
    });
    return { message: 'Chat history cleared' };
  }
}
