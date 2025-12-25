import { Injectable } from '@nestjs/common';
import { Log } from 'src/logs/entities/log.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchLogsDto } from './dto/search-logs.dto';

@Injectable()
export class SearchService {
    constructor(
    @InjectRepository(Log)
    private readonly logRepo: Repository<Log>,
  ) {}

  async search(dto: SearchLogsDto) {
    const qb = this.logRepo.createQueryBuilder('log');

    if (dto.action)
      qb.andWhere('log.action = :action', { action: dto.action });

    if (dto.protocol)
      qb.andWhere('log.protocol = :protocol', { protocol: dto.protocol });

    if (dto.src_ip)
      qb.andWhere('log.src_ip = :src_ip', { src_ip: dto.src_ip });

    if (dto.dest_ip)
      qb.andWhere('log.dest_ip = :dest_ip', { dest_ip: dto.dest_ip });

    if (dto.from && dto.to)
      qb.andWhere('log.timestamp BETWEEN :from AND :to', {
        from: dto.from,
        to: dto.to,
      });

    const page = dto.page || 1;
    const limit = dto.limit || 20;

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { total, page, limit, data };
  }
  /*
  create(createSearchDto: CreateSearchDto) {
    return 'This action adds a new search';
  }

  findAll() {
    return `This action returns all search`;
  }

  findOne(id: number) {
    return `This action returns a #${id} search`;
  }

  update(id: number, updateSearchDto: UpdateSearchDto) {
    return `This action updates a #${id} search`;
  }

  remove(id: number) {
    return `This action removes a #${id} search`;
  }
    */
}
