"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Camera, CameraOff } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

interface QrScannerProps {
  onScan: (qrCode: string) => void;
}

export function QrScanner({ onScan }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-reader";

  useEffect(() => {
    scannerRef.current = new Html5Qrcode(scannerContainerId);

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    if (!scannerRef.current) return;

    setLoading(true);
    setPermissionDenied(false);

    try {
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanner();
        },
        (errorMessage) => {
          console.log("QR Scan Error:", errorMessage);
        }
      );

      // Ensure video element exists before accessing
      const videoElement = document.querySelector(`#${scannerContainerId} video`) as HTMLVideoElement | null;
      if (videoElement) {
        videoElement.onloadedmetadata = () => setIsScanning(true);
      } else {
        console.warn("Video element not found");
      }
    } catch (err) {
      console.error("Error starting scanner:", err);
      setPermissionDenied(true);
    } finally {
      setLoading(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (error) {
        console.error("Error stopping scanner:", error);
      } finally {
        scannerRef.current = null;
        setIsScanning(false);
      }
    }
  };

  return (
    <Card className="w-full max-w-md p-4">
      <div className="flex flex-col items-center gap-4">
        <div
          id={scannerContainerId}
          className={`w-full h-64 bg-muted rounded-md overflow-hidden flex items-center justify-center ${
            isScanning ? "border-2 border-primary" : ""
          }`}
        >
          {!isScanning && !loading && (
            <div className="text-center text-muted-foreground">
              <Camera className="mx-auto h-12 w-12 mb-2" />
              <p>Camera preview will appear here</p>
            </div>
          )}
          {loading && (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Initializing camera...</p>
            </div>
          )}
          {permissionDenied && (
            <div className="text-center text-destructive">
              <CameraOff className="mx-auto h-12 w-12 mb-2" />
              <p>Camera access denied</p>
              <p className="text-sm">Please allow camera access to scan QR codes</p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {!isScanning ? (
            <Button onClick={startScanner} disabled={loading || permissionDenied}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Start Scanning
            </Button>
          ) : (
            <Button variant="outline" onClick={stopScanner}>
              Stop Scanning
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
