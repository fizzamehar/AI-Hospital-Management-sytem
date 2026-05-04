import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MedicalRecordsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    let doctorId = data.doctorId;

    // The frontend might send a User ID instead of a Doctor ID
    const doctor = await this.prisma.doctor.findFirst({
      where: {
        OR: [
          { id: doctorId },
          { userId: doctorId }
        ]
      }
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return this.prisma.medicalRecord.create({
      data: {
        patientId: data.patientId,
        doctorId: doctor.id,
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        documentUrl: data.documentUrl,
      },
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
    } else if (user?.role === 'DOCTOR') {
      const doctor = await this.prisma.doctor.findUnique({
        where: { userId: user.id },
      });
      if (doctor) {
        where = { doctorId: doctor.id };
      }
    }

    return this.prisma.medicalRecord.findMany({
      where,
      include: {
        patient: { include: { user: { select: { name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        patient: { include: { user: { select: { name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      },
    });
    if (!record) throw new NotFoundException('Medical Record not found');
    return record;
  }
}
