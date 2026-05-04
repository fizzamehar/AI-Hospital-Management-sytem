import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  // CREATE
  async create(data: any, user?: any) {
    let patientId = data.patientId;
    
    // Automatically resolve patientId if the user is a PATIENT
    if (!patientId && user?.role === 'PATIENT') {
      const patient = await this.prisma.patient.findUnique({ where: { userId: user.id } });
      if (patient) patientId = patient.id;
    }

    if (!patientId || !data.doctorId) {
      throw new BadRequestException('patientId and doctorId are required');
    }

    try {
      return await this.prisma.appointment.create({
        data: {
          patient: {
            connect: { id: patientId },
          },
          doctor: {
            connect: { id: data.doctorId },
          },
          symptoms: data.symptoms || '',
          status: data.status || 'PENDING',
          ...(data.date && { date: new Date(data.date) }),
        },
        include: {
          patient: { include: { user: { select: { name: true, email: true } } } },
          doctor: { include: { user: { select: { name: true } } } },
        },
      });
    } catch (error) {
      throw new BadRequestException(
        'Error creating appointment. Check patientId/doctorId.',
      );
    }
  }

  // READ ALL (role-filtered)
  async findAll(user?: any) {
    let where = {};

    if (user?.role === 'DOCTOR') {
      const doctor = await this.prisma.doctor.findUnique({
        where: { userId: user.id },
      });
      if (doctor) {
        where = { doctorId: doctor.id };
      }
    } else if (user?.role === 'PATIENT') {
      const patient = await this.prisma.patient.findUnique({
        where: { userId: user.id },
      });
      if (patient) {
        where = { patientId: patient.id };
      }
    }

    return this.prisma.appointment.findMany({
      where,
      include: {
        patient: { include: { user: { select: { name: true, email: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // READ ONE
  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { include: { user: { select: { name: true, email: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  // UPDATE
  async update(id: string, data: any) {
    const exists = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!exists) {
      throw new NotFoundException('Appointment not found');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        ...(data.symptoms && { symptoms: data.symptoms }),
        ...(data.status && { status: data.status }),
        ...(data.date && { date: new Date(data.date) }),
      },
    });
  }

  // DELETE
  async delete(id: string) {
    const exists = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!exists) {
      throw new NotFoundException('Appointment not found');
    }

    return this.prisma.appointment.delete({
      where: { id },
    });
  }

  // COMPLETE APPOINTMENT WORKFLOW
  async completeAppointment(id: string, data: any) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { patient: true, doctor: true },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    if (appointment.status === 'COMPLETED') {
      throw new BadRequestException('Appointment is already completed');
    }

    // Wrap in transaction to ensure atomicity
    return this.prisma.$transaction(async (prisma) => {
      // 1. Update Appointment Status
      const updatedAppt = await prisma.appointment.update({
        where: { id },
        data: { status: 'COMPLETED' },
      });

      // 2. Create Prescription
      const prescription = await prisma.prescription.create({
        data: {
          doctorId: appointment.doctorId,
          patientId: appointment.patientId,
          appointmentId: appointment.id,
          notes: data.notes || '',
          medicines: data.medicines || '',
        },
      });

      // 3. Create Medical Record
      const medicalRecord = await prisma.medicalRecord.create({
        data: {
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          diagnosis: data.diagnosis || data.notes || 'No diagnosis provided',
          treatment: data.medicines || 'No treatment provided',
          date: new Date(),
        },
      });

      // 4. Generate Auto Bill
      const medsCount = data.medicines ? data.medicines.split(',').length : 0;
      const amount = 500 + medsCount * 100; // Example calculation
      const bill = await prisma.billing.create({
        data: {
          patientId: appointment.patientId,
          amount,
          status: 'UNPAID',
          date: new Date(),
        },
      });

      return {
        appointment: updatedAppt,
        prescription,
        medicalRecord,
        bill,
      };
    });
  }
}
