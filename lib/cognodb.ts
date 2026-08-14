import neo4j, { Driver, Session } from "neo4j-driver";

function toPlainValue(value: unknown): unknown {
  if (neo4j.isInt(value)) {
    return value.toNumber();
  }
  if (Array.isArray(value)) {
    return value.map(toPlainValue);
  }
  if (value !== null && typeof value === "object") {
    if ("properties" in value) {
      return toPlainValue((value as { properties: unknown }).properties);
    }
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, toPlainValue(v)])
    );
  }
  return value;
}

let driver: Driver | null = null;

function getDriver(): Driver {
  if (driver) return driver;

  const uri = process.env.COGNODB_URI;
  const username = process.env.COGNODB_USERNAME;
  const password = process.env.COGNODB_PASSWORD;

  if (!uri || !username || !password) {
    throw new Error("CognoDB credentials are not configured.");
  }

  driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  return driver;
}

export function getSession(): Session {
  return getDriver().session();
}

export async function runQuery<T = Record<string, unknown>>(
  cypher: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const session = getSession();
  try {
    const result = await session.run(cypher, params);
    return result.records.map((record) => toPlainValue(record.toObject()) as T);
  } finally {
    await session.close();
  }
}

export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}
