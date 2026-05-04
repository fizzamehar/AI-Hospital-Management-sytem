import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.billing.create({
      data: {
        patientId: data.patientId,
        amount: parseFloat(data.amount),
        status: data.status || 'UNPAID',
      },
      include: { patient: { include: { user: { select: { name: true } } } } },
    });
  }

  async findAll(user?: any) {
    let where = {};
    if (user?.role === 'PATIENT') {
      const patient = await this.prisma.patient.findUnique({
        where: { userId: user.id },
      });
      if (patient) {
        where = { patientId: patient.id };
      }
    }

    return this.prisma.billing.findMany({
      where,
      include: { patient: { include: { user: { select: { name: true, email: true } } } } },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const billing = await this.prisma.billing.findUnique({
      where: { id },
      include: { patient: { include: { user: { select: { name: true } } } } },
    });
    if (!billing) throw new NotFoundException('Invoice not found');
    return billing;
  }

  async update(id: string, data: any) {
    return this.prisma.billing.update({
      where: { id },
      data: {
        status: data.status,
      },
    });
  }
}
