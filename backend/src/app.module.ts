import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';

// Feature Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PatientsModule } from './patients/patients.module';
import { DoctorsModule } from './doctors/doctors.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { ChatbotModule } from './ai/ai.module';
import { BillingModule } from './billing/billing.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';

// Prisma
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Database (Global Prisma)
    PrismaModule,

    // Authentication
    AuthModule,

    // Feature Modules
    UsersModule,
    PatientsModule,
    DoctorsModule,
    AppointmentsModule,
    PrescriptionsModule,
    ChatbotModule,
    BillingModule,
    MedicalRecordsModule,
  ],

  controllers: [AppController],
  providers: [],
})
export class AppModule {}
