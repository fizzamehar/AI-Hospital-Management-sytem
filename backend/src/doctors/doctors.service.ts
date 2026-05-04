import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  // CREATE
  async create(data: any) {
    if (!data.specialization) {
      throw new BadRequestException('Specialization is required');
    }

    try {
      return await this.prisma.doctor.create({
        data: {
          specialization: data.specialization,
          experience: data.experience || null,
          available: data.available ?? true,
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
      throw new BadRequestException('Error creating doctor. Check userId.');
    }
  }

  // READ ALL
  async findAll() {
    return this.prisma.doctor.findMany({
      include: { user: { select: { id: true, name: true, email: true, contact: true } } },
    });
  }

  // READ ONE
  async findOne(id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, contact: true } },
        appointments: {
          include: {
            patient: { include: { user: { select: { name: true } } } },
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }

  // Get assigned patients (via appointments)
  async getAssignedPatients(doctorId: string) {
    const appointments = await this.prisma.appointment.findMany({
      where: { doctorId },
      include: {
        patient: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
      distinct: ['patientId'],
    });

    return appointments.map((a) => a.patient);
  }

  // UPDATE
  async update(id: string, data: any) {
    const exists = await this.prisma.doctor.findUnique({
      where: { id },
    });

    if (!exists) {
      throw new NotFoundException('Doctor not found');
    }

    return this.prisma.doctor.update({
      where: { id },
      data: {
        ...(data.specialization && { specialization: data.specialization }),
        ...(data.experience !== undefined && { experience: data.experience }),
        ...(data.available !== undefined && { available: data.available }),
      },
    });
  }

  // DELETE
  async delete(id: string) {
    const exists = await this.prisma.doctor.findUnique({
      where: { id },
    });

    if (!exists) {
      throw new NotFoundException('Doctor not found');
    }

    return this.prisma.doctor.delete({
      where: { id },
    });
  }
}
