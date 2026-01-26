export interface UploadResponse {
  message: string;
  fileId: string; 
  linesProcessed: number;
  linesIgnored: number;
  warning?: string;
}
