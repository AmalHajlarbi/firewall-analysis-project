import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/role-permission.enum';
import { CreateUserDto } from '../../users/dto/create-user.dto';

export class RegisterDto extends CreateUserDto {
  @ApiProperty({ 
    enum: UserRole, 
    example: UserRole.ANALYST,
    description: 'User role (only admins can assign ADMIN role)',
    required: false 
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.ANALYST;
}