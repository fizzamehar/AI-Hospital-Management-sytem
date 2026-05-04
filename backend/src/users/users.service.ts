import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // CREATE (with password hashing)
  async create(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        contact: true,
        createdAt: true,
      },
    });
  }

  // READ ALL (exclude passwords)
  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        contact: true,
        createdAt: true,
        patient: true,
        doctor: true,
      },
    });
  }

  // READ ONE
  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        contact: true,
        createdAt: true,
        patient: true,
        doctor: true,
      },
    });
  }

  // UPDATE
  update(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        contact: true,
      },
    });
  }

  // DELETE
  delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  // Stats for admin dashboard
  async getStats() {
    const [totalUsers, totalPatients, totalDoctors, totalAppointments] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.patient.count(),
        this.prisma.doctor.count(),
        this.prisma.appointment.count(),
      ]);

    const recentAppointments = await this.prisma.appointment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { include: { user: { select: { name: true, email: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      },
    });

    return {
      totalUsers,
      totalPatients,
      totalDoctors,
      totalAppointments,
      recentAppointments,
    };
  }
}
