export interface PendingResponse<RES = any, REJ = any> {
  resolve: (data: RES) => void;
  reject: (error: REJ) => void;
  timeout: NodeJS.Timeout;
  sentAt: number;
}

export interface ConnectionInfo {
  headers: Readonly<Record<string, string | string[] | undefined>>;
  url?: string;
  remoteAddress?: string;
}
