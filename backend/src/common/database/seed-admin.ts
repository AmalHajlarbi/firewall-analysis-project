import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { UsersService } from '../../users/users.service';
import { UserRole } from '../enums/role-permission.enum';

async function bootstrap() {
  const logger = new Logger('SeedAdmin');  
  try {
    // Create standalone application context 
    const app = await NestFactory.createApplicationContext(AppModule);
    
    // Get the UsersService
    const usersService = app.get(UsersService);
    
    // Check if admin already exists
    const adminCount = await usersService.getAdminCount();
    
    if (adminCount > 0) {
      logger.log('Admin user already exists. Skipping seed.');
    } else {
      logger.log('No admin found. Creating first admin...');
      
      // Create admin with environment variables or defaults
      const adminEmail = process.env.FIRST_ADMIN_EMAIL || 'admin@firewall.com';
      const adminUsername = process.env.FIRST_ADMIN_USERNAME || 'admin';
      const adminPassword = process.env.FIRST_ADMIN_PASSWORD || 'Admin123';
      
      await usersService.create({
        email: adminEmail,
        username: adminUsername,
        password: adminPassword,
        role: UserRole.ADMIN,
        isActive: true,
      });
      
      logger.log(`First admin created successfully!`);
      logger.warn(`Email: ${adminEmail}`);
      logger.warn(`Username: ${adminUsername}`);
      logger.warn(`CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN!`);
    }
    
    
    await app.close();
    logger.log('Seed script completed.');
    
  } catch (error) {
    logger.error('Failed to seed admin:', error);
    process.exit(1);
  }
}

bootstrap();