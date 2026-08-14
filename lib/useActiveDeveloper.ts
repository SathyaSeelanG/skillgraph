"use client";

import { useCallback, useEffect, useState } from "react";
import { ACTIVE_DEVELOPER_STORAGE_KEY, PRIMARY_DEVELOPER_ID } from "@/lib/types";

const ACTIVE_DEVELOPER_CHANGE_EVENT = "skillgraph:activeDeveloperChange";

export function getActiveDeveloperId(): string {
  if (typeof window === "undefined") return PRIMARY_DEVELOPER_ID;
  return localStorage.getItem(ACTIVE_DEVELOPER_STORAGE_KEY) ?? PRIMARY_DEVELOPER_ID;
}

export function setActiveDeveloperId(id: string) {
  localStorage.setItem(ACTIVE_DEVELOPER_STORAGE_KEY, id);
  window.dispatchEvent(new CustomEvent(ACTIVE_DEVELOPER_CHANGE_EVENT, { detail: id }));
}

export function clearActiveDeveloperId() {
  localStorage.removeItem(ACTIVE_DEVELOPER_STORAGE_KEY);
  window.dispatchEvent(
    new CustomEvent(ACTIVE_DEVELOPER_CHANGE_EVENT, { detail: PRIMARY_DEVELOPER_ID })
  );
}

// Shared "active developer id" state, backed by localStorage, kept in sync across
// every component that calls this hook (Navbar selector, Dashboard, Jobs, Graph, etc.)
// via a same-tab custom event, since the native `storage` event only fires cross-tab.
export function useActiveDeveloperId(): [string, (id: string) => void] {
  const [id, setId] = useState<string>(PRIMARY_DEVELOPER_ID);

  useEffect(() => {
    setId(getActiveDeveloperId());
    function handleChange(e: Event) {
      setId((e as CustomEvent<string>).detail);
    }
    window.addEventListener(ACTIVE_DEVELOPER_CHANGE_EVENT, handleChange);
    return () => window.removeEventListener(ACTIVE_DEVELOPER_CHANGE_EVENT, handleChange);
  }, []);

  const update = useCallback((next: string) => {
    setActiveDeveloperId(next);
  }, []);

  return [id, update];
}
