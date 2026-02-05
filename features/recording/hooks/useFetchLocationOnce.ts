import { useCallback } from "react";
import * as Location from "expo-location";
import type { GeoPoint } from "@/core/types/types";

type LocationResult =
  | {
      ok: true;
      location: GeoPoint;
    }
  | { ok: false; reason: string };

export default function useFetchLocationOnce() {
  const fetchLocationOnce = useCallback(async (): Promise<LocationResult> => {
    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        ok: true,
        location: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        },
      };
    } catch (e: any) {
      return { ok: false, reason: String(e?.message ?? e) };
    }
  }, []);

  return { fetchLocationOnce };
}
