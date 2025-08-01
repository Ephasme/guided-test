import { CalendarService } from "./calendarService";

export class CalendarServiceFactory {
  create(accessToken: string): CalendarService {
    return new CalendarService(accessToken);
  }
}
