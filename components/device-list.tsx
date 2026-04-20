"use client";

import { useMemo, useState, useTransition } from "react";
import { LaptopMinimalCheck, Search, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/ui/table";
import type { DeviceRecord } from "@/lib/types";

interface DeviceListProps {
  devices: DeviceRecord[];
}

export function DeviceList({ devices: initialDevices }: DeviceListProps) {
  const [devices, setDevices] = useState<DeviceRecord[]>(initialDevices);
  const [query, setQuery] = useState("");
  const [range, setRange] = useState("192.168.1.0/24");
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase();
    if (!normalized) {
      return devices;
    }

    return devices.filter((device) => {
      const content = [device.ip, device.hostname, device.manufacturer, device.model].join(" ").toLowerCase();
      return content.includes(normalized);
    });
  }, [devices, query]);

  const handleScan = () => {
    startTransition(async () => {
      setFeedback("");

      const response = await fetch("/api/devices/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ range, mergeWithExisting: true })
      });

      const data = (await response.json()) as { devices?: DeviceRecord[]; error?: string };
      if (!response.ok || !data.devices) {
        setFeedback(data.error ?? "Unable to complete scan.");
        return;
      }

      setDevices(data.devices);
      setFeedback(`Scan complete. ${data.devices.length} devices currently tracked.`);
    });
  };

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <LaptopMinimalCheck className="h-4 w-4 text-cyan-300" />
            Device Inventory
          </CardTitle>
          <CardDescription>
            Run active discovery to refresh what is currently on your network and detect unmanaged endpoints.
          </CardDescription>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
          <Input
            value={range}
            onChange={(event) => setRange(event.target.value)}
            className="w-full md:w-52"
            placeholder="192.168.1.0/24"
            aria-label="Scan range"
          />
          <Button onClick={handleScan} disabled={isPending}>
            {isPending ? "Scanning..." : "Discover Devices"}
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
        <Input
          className="pl-9"
          placeholder="Filter by IP, host, vendor, model"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {feedback ? <p className="text-sm text-cyan-300">{feedback}</p> : null}

      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <Table>
          <Thead>
            <Tr>
              <Th>Device</Th>
              <Th>IP</Th>
              <Th>Vendor</Th>
              <Th>Firmware</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtered.map((device) => (
              <Tr key={device.id}>
                <Td>
                  <div className="font-medium text-slate-100">{device.hostname}</div>
                  <div className="text-xs text-slate-400">{device.model}</div>
                </Td>
                <Td className="font-mono text-xs">{device.ip}</Td>
                <Td>{device.manufacturer}</Td>
                <Td>{device.firmwareVersion}</Td>
                <Td>
                  <Badge className={device.status === "online" ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300" : "border-slate-600 bg-slate-700/30"}>
                    {device.status === "online" ? <Wifi className="mr-1 h-3 w-3" /> : <WifiOff className="mr-1 h-3 w-3" />}
                    {device.status}
                  </Badge>
                </Td>
              </Tr>
            ))}
            {filtered.length === 0 ? (
              <Tr>
                <Td colSpan={5} className="py-8 text-center text-slate-400">
                  No devices match this filter.
                </Td>
              </Tr>
            ) : null}
          </Tbody>
        </Table>
      </div>
    </Card>
  );
}
