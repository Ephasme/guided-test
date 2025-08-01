import { z } from "zod";
export const WeatherAPIResponseSchema = z.object({
  location: z.object({
    name: z.string(),
    region: z.string(),
    country: z.string(),
    lat: z.number(),
    lon: z.number(),
    tz_id: z.string(),
    localtime_epoch: z.number(),
    localtime: z.string(),
  }),
  current: z.object({
    last_updated_epoch: z.number(),
    last_updated: z.string(),
    temp_c: z.number(),
    temp_f: z.number(),
    is_day: z.number(),
    condition: z.object({
      text: z.string(),
      icon: z.string(),
      code: z.number(),
    }),
    wind_mph: z.number(),
    wind_kph: z.number(),
    wind_degree: z.number(),
    wind_dir: z.string(),
    pressure_mb: z.number(),
    pressure_in: z.number(),
    precip_mm: z.number(),
    precip_in: z.number(),
    humidity: z.number(),
    cloud: z.number(),
    feelslike_c: z.number(),
    feelslike_f: z.number(),
    vis_km: z.number(),
    vis_miles: z.number(),
    uv: z.number(),
    gust_mph: z.number(),
    gust_kph: z.number(),
    air_quality: z
      .object({
        co: z.number(),
        no2: z.number(),
        o3: z.number(),
        so2: z.number(),
        pm2_5: z.number(),
        pm10: z.number(),
        "us-epa-index": z.number(),
      })
      .optional(),
  }),
  forecast: z
    .object({
      forecastday: z.array(
        z.object({
          date: z.string(),
          date_epoch: z.number(),
          day: z.object({
            maxtemp_c: z.number(),
            maxtemp_f: z.number(),
            mintemp_c: z.number(),
            mintemp_f: z.number(),
            avgtemp_c: z.number(),
            avgtemp_f: z.number(),
            maxwind_mph: z.number(),
            maxwind_kph: z.number(),
            totalprecip_mm: z.number(),
            totalprecip_in: z.number(),
            totalsnow_cm: z.number(),
            avgvis_km: z.number(),
            avgvis_miles: z.number(),
            avghumidity: z.number(),
            daily_will_it_rain: z.number(),
            daily_chance_of_rain: z.number(),
            daily_will_it_snow: z.number(),
            daily_chance_of_snow: z.number(),
            condition: z.object({
              text: z.string(),
              icon: z.string(),
              code: z.number(),
            }),
            uv: z.number(),
          }),
          hour: z
            .array(
              z.object({
                time_epoch: z.number(),
                time: z.string(),
                temp_c: z.number(),
                temp_f: z.number(),
                is_day: z.number(),
                condition: z.object({
                  text: z.string(),
                  icon: z.string(),
                  code: z.number(),
                }),
                wind_mph: z.number(),
                wind_kph: z.number(),
                wind_degree: z.number(),
                wind_dir: z.string(),
                pressure_mb: z.number(),
                pressure_in: z.number(),
                precip_mm: z.number(),
                precip_in: z.number(),
                humidity: z.number(),
                cloud: z.number(),
                feelslike_c: z.number(),
                feelslike_f: z.number(),
                windchill_c: z.number(),
                windchill_f: z.number(),
                heatindex_c: z.number(),
                heatindex_f: z.number(),
                dewpoint_c: z.number(),
                dewpoint_f: z.number(),
                will_it_rain: z.number(),
                chance_of_rain: z.number(),
                will_it_snow: z.number(),
                chance_of_snow: z.number(),
                vis_km: z.number(),
                vis_miles: z.number(),
                gust_mph: z.number(),
                gust_kph: z.number(),
                uv: z.number(),
              })
            )
            .optional(),
        })
      ),
    })
    .optional(),
  alerts: z
    .object({
      alert: z.array(
        z.object({
          headline: z.string(),
          msgtype: z.string(),
          severity: z.string(),
          urgency: z.string(),
          areas: z.string(),
          category: z.string(),
          certainty: z.string(),
          event: z.string(),
          note: z.string(),
          effective: z.string(),
          expires: z.string(),
          desc: z.string(),
          instruction: z.string(),
        })
      ),
    })
    .optional(),
  error: z
    .object({
      code: z.number(),
      message: z.string(),
    })
    .optional(),
});

export type WeatherAPIResponse = z.infer<typeof WeatherAPIResponseSchema>;
