import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // Validate user credentials (used by LocalStrategy)
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  // Generate JWT token on login
  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    return {
      message: 'Login successful',
      user,
      access_token: this.jwtService.sign(payload),
    };
  }

  // Register new user
  async register(dto: RegisterDto) {
    // Check if user already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: dto.role as any,
        contact: dto.contact,
      },
    });

    // Auto-create Patient or Doctor profile
    if (dto.role === 'PATIENT') {
      await this.prisma.patient.create({
        data: { userId: user.id },
      });
    } else if (dto.role === 'DOCTOR') {
      await this.prisma.doctor.create({
        data: {
          userId: user.id,
          specialization: 'General',
        },
      });
    }

    const { password: _, ...safeUser } = user;

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    return {
      message: 'Registration successful',
      user: safeUser,
      access_token: this.jwtService.sign(payload),
    };
  }

  // Get user profile
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        patient: true,
        doctor: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  // Update user profile
  async updateProfile(userId: string, data: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    let hashedPassword = user.password;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name !== undefined ? data.name : user.name,
        email: data.email !== undefined ? data.email : user.email,
        password: hashedPassword,
        contact: data.contact !== undefined ? data.contact : user.contact,
        profilePicture: data.profilePicture !== undefined ? data.profilePicture : user.profilePicture,
      },
    });

    if (user.role === 'PATIENT' && data.patientDetails) {
      await this.prisma.patient.update({
        where: { userId: user.id },
        data: {
          address: data.patientDetails.address,
          age: data.patientDetails.age ? parseInt(data.patientDetails.age, 10) : undefined,
        },
      });
    } else if (user.role === 'DOCTOR' && data.doctorDetails) {
      await this.prisma.doctor.update({
        where: { userId: user.id },
        data: {
          specialization: data.doctorDetails.specialization,
          experience: data.doctorDetails.experience ? parseInt(data.doctorDetails.experience, 10) : undefined,
        },
      });
    }

    const { password: _, ...safeUser } = updatedUser;
    return safeUser;
  }
}
