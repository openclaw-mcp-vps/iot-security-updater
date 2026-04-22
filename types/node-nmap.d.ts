declare module "node-nmap" {
  export const nmapLocation: string;
  export class NmapScan {
    constructor(range: string, flags?: string);
    on(event: "complete", listener: (data: unknown[]) => void): void;
    on(event: "error", listener: (error: Error) => void): void;
    startScan(): void;
  }
}
