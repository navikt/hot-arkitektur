"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { DatabaseModel } from "./model";

const DatabaseModelContext = createContext<DatabaseModel | null>(null);

/** Gir diagrammene på siden samme modell, så den bare sendes til nettleseren én gang. */
export function DatabaseModelProvider({ model, children }: { model: DatabaseModel; children: ReactNode }) {
  return <DatabaseModelContext.Provider value={model}>{children}</DatabaseModelContext.Provider>;
}

export function useDatabaseModel(): DatabaseModel {
  const model = useContext(DatabaseModelContext);
  if (!model) throw new Error("ErDiagram må ligge i en DatabaseModelProvider");
  return model;
}
