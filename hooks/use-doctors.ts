"use client";

import { useEffect, useState } from "react";
import type { Doctor } from "@/lib/types";

interface UseDoctorsResult {
  doctors: Doctor[];
  loading: boolean;
  error: string | null;
}

export function useDoctors(): UseDoctorsResult {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/doctors");

        if (!response.ok) {
          throw new Error("Failed to load doctors");
        }

        const data = await response.json();
        if (isMounted) {
          setDoctors(Array.isArray(data.doctors) ? data.doctors : []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setDoctors([]);
          setError(
            err instanceof Error ? err.message : "Failed to load doctors",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDoctors();

    return () => {
      isMounted = false;
    };
  }, []);

  return { doctors, loading, error };
}
