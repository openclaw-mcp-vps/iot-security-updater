declare module "node-nmap" {
  type Listener = (...args: unknown[]) => void;

  export class NmapScan {
    constructor(host: string, flags: string);
    on(event: "complete" | "error", listener: Listener): void;
    startScan(): void;
  }
}
