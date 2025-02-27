export interface PendingResponse<RES = any, REJ = any> {
  resolve: (data: RES) => void;
  reject: (error: REJ) => void;
  timeout: NodeJS.Timeout;
  sentAt: number;
}
