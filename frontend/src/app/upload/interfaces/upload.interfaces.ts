export interface UploadResponse {
  message: string;
  linesProcessed: number;
  linesIgnored: number;
  warning?: string;
}
