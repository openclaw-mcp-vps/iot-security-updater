declare module "node-nmap" {
  const value: {
    nmapLocation: string;
    QuickScan: new (target: string, flags?: string) => {
      on: (event: string, callback: (...args: any[]) => void) => void;
      startScan: () => void;
    };
  };
  export default value;
}

declare module "ssh2" {
  export class Client {
    on: (event: string, callback: (...args: any[]) => void) => Client;
    connect: (options: Record<string, any>) => void;
    exec: (
      command: string,
      callback: (
        error: Error | undefined,
        stream: {
          on: (event: string, handler: (...args: any[]) => void) => any;
        }
      ) => void
    ) => void;
    end: () => void;
  }
}
