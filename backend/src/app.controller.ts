import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello() {
    return {
      message: 'MedCore HMS API is running',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        patients: '/api/patients',
        doctors: '/api/doctors',
        appointments: '/api/appointments',
        prescriptions: '/api/prescriptions',
        chatbot: '/api/chatbot',
      },
    };
  }
}
