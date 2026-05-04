import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  // CREATE
  async create(data: any) {
    try {
      return await this.prisma.patient.create({
        data: {
          address: data.address || null,
          age: data.age || null,
          ...(data.userId
            ? {
                user: {
                  connect: { id: data.userId },
                },
              }
            : {}),
        },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
    } catch (error) {
      throw new BadRequestException('Error creating patient. Check userId.');
    }
  }

  // READ ALL
  async findAll() {
    return this.prisma.patient.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, contact: true } },
        appointments: {
          take: 3,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  // READ ONE
  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, contact: true } },
        appointments: {
          include: {
            doctor: { include: { user: { select: { name: true } } } },
          },
          orderBy: { createdAt: 'desc' },
        },
        prescriptions: {
          include: {
            doctor: { include: { user: { select: { name: true } } } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }

  // UPDATE
  async update(id: string, data: any) {
    const exists = await this.prisma.patient.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Patient not found');

    return this.prisma.patient.update({
      where: { id },
      data: {
        ...(data.address !== undefined && { address: data.address }),
        ...(data.age !== undefined && { age: data.age }),
      },
    });
  }

  // DELETE
  async delete(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return this.prisma.patient.delete({
      where: { id },
    });
  }
}
