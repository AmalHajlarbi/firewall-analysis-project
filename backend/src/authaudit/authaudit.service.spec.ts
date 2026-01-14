import { Test, TestingModule } from '@nestjs/testing';
import { AuthAuditService } from './authaudit.service';

describe('AuthauditService', () => {
  let service: AuthAuditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthAuditService],
    }).compile();

    service = module.get<AuthAuditService>(AuthAuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
