// packages/shared/src/utils/resolveUserLocation.ts
import { DateTime } from "luxon";
import env from "env-var";

type LocationData = {
  city: string;
  countryName: string;
  timezone: string;
};

const IPAPI_API_KEY = env.get("IPAPI_API_KEY").required().asString();

export async function resolveUserLocation(ip: string): Promise<LocationData> {
  const res = await fetch(`https://ipapi.co/${ip}/json/?key=${IPAPI_API_KEY}`);
  const data = await res.json();

  console.log(data);

  return {
    city: data.city,
    countryName: data.country_name,
    timezone: data.timezone || "UTC",
  };
}

export function getTodayForTimezone(timezone: string): string {
  const today = DateTime.now().setZone(timezone).toISODate();

  if (!today) {
    throw new Error(`Invalid timezone: ${timezone}. Unable to generate date.`);
  }

  return today;
}
