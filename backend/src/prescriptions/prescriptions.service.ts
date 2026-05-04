import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) {}

  // ✅ CREATE
  async create(data: any) {
    if (!data.doctorId || !data.patientId) {
      throw new BadRequestException('doctorId and patientId are required');
    }

    return this.prisma.prescription.create({
      data: {
        doctor: {
          connect: { id: data.doctorId },
        },
        patient: {
          connect: { id: data.patientId },
        },
        notes: data.notes || '',
        medicines: data.medicines || '',
      },
      include: {
        doctor: true,
        patient: true,
      },
    });
  }

  // ✅ READ ALL
  async findAll(user?: any) {
    let where = {};
    if (user?.role === 'PATIENT') {
      const patient = await this.prisma.patient.findUnique({
        where: { userId: user.id },
      });
      if (patient) {
        where = { patientId: patient.id };
      }
    } else if (user?.role === 'DOCTOR') {
      const doctor = await this.prisma.doctor.findUnique({
        where: { userId: user.id },
      });
      if (doctor) {
        where = { doctorId: doctor.id };
      }
    }

    return this.prisma.prescription.findMany({
      where,
      include: {
        doctor: { include: { user: { select: { name: true } } } },
        patient: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ✅ READ ONE
  async findOne(id: string) {
    const record = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        doctor: true,
        patient: true,
      },
    });

    if (!record) {
      throw new NotFoundException('Prescription not found');
    }

    return record;
  }

  // ✅ UPDATE
  async update(id: string, data: any) {
    const exists = await this.prisma.prescription.findUnique({
      where: { id },
    });

    if (!exists) {
      throw new NotFoundException('Prescription not found');
    }

    return this.prisma.prescription.update({
      where: { id },
      data: {
        ...(data.notes && { notes: data.notes }),
        ...(data.medicines && { medicines: data.medicines }),
      },
    });
  }

  // ✅ DELETE
  async delete(id: string) {
    const exists = await this.prisma.prescription.findUnique({
      where: { id },
    });

    if (!exists) {
      throw new NotFoundException('Prescription not found');
    }

    return this.prisma.prescription.delete({ where: { id } });
  }
}
