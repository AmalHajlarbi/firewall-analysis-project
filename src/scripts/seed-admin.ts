import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { UserRole } from '../common/enums/role-permission.enum';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('SeedAdmin');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  
  const adminData = {
    email: 'admin@firewall.com',
    username: 'firewall_admin',
    password: 'AdminPass123!', // CHANGE THIS IN PRODUCTION!
    firstName: 'System',
    lastName: 'Administrator',
    role: UserRole.ADMIN,
    isActive: true,
  };
  
  try {
    // Check if admin already exists
    const existingAdmin = await usersService.findByEmail(adminData.email);
    
    if (existingAdmin) {
      logger.log('Admin user already exists');
    } else {
      // Create admin user
      const adminUser = await usersService.create(adminData);
      logger.log(`Admin user created: ${adminUser.email}`);
    }
    
    // Create a test analyst user
    const analystData = {
      email: 'analyst@firewall.com',
      username: 'firewall_analyst',
      password: 'AnalystPass123!', // CHANGE THIS!
      firstName: 'Test',
      lastName: 'Analyst',
      role: UserRole.ANALYST,
      isActive: true,
    };
    
    const existingAnalyst = await usersService.findByEmail(analystData.email);
    if (!existingAnalyst) {
      await usersService.create(analystData);
      logger.log(`Analyst user created: ${analystData.email}`);
    }
    
  } catch (error) {
    logger.error('Error seeding users:', error.message);
  } finally {
    await app.close();
  }
}

bootstrap();