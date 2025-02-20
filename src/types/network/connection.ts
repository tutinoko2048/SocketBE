export interface PendingResponseData<RES, REJ> {
  resolve: (data: RES) => void;
  reject: (error: REJ) => void;
  timeout: NodeJS.Timeout;
  sentAt: number;
}
