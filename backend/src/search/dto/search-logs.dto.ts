export class SearchLogsDto {
  action?: string;
  protocol?: string;
  src_ip?: string;
  dest_ip?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}
