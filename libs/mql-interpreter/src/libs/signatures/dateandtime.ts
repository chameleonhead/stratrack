import { BuiltinSignaturesMap } from "./types";

// https://docs.mql4.com/dateandtime
export const dateandtimeBuiltinSignatures: BuiltinSignaturesMap = {
  Day: {
    args: [],
    returnType: "int",
    description:
      "Returns the current day of the month, i.e., the day of month of the last known server time",
  },
  DayOfWeek: {
    args: [],
    returnType: "int",
    description: "Returns the current zero-based day of the week of the last known server time",
  },
  DayOfYear: {
    args: [],
    returnType: "int",
    description:
      "Returns the current day of the year i.e., the day of year of the last known server time",
  },
  Hour: {
    args: [],
    returnType: "int",
    description:
      "Returns the hour of the last known server time by the moment of the program start",
  },
  Minute: {
    args: [],
    returnType: "int",
    description:
      "Returns the current minute of the last known server time by the moment of the program start",
  },
  Month: {
    args: [],
    returnType: "int",
    description:
      "Returns the current month as number, i.e., the number of month of the last known server time",
  },
  Seconds: {
    args: [],
    returnType: "int",
    description:
      "Returns the amount of seconds elapsed from the beginning of the current minute of the last known server time by the moment of the program start",
  },
  StructToTime: {
    args: [],
    returnType: "datetime",
    description: "Converts a variable of MqlDateTime structure type into a datetime value",
  },
  TimeCurrent: {
    args: [],
    returnType: "datetime",
    description:
      "Returns the last known server time (time of the last quote receipt) in the datetime format",
  },
  TimeDay: {
    args: [{ name: "date_time", type: "datetime", optional: true }],
    returnType: "int",
    description: "Returns the day of month of the specified date",
  },
  TimeDaylightSavings: {
    args: [],
    returnType: "int",
    description: "Returns the sign of Daylight Saving Time switch",
  },
  TimeDayOfWeek: {
    args: [],
    returnType: "int",
    description: "Returns the zero-based day of week of the specified date",
  },
  TimeDayOfYear: {
    args: [{ name: "date_time", type: "datetime", optional: true }],
    returnType: "int",
    description: "Returns the day of year of the specified date",
  },
  TimeGMT: {
    args: [],
    returnType: "datetime",
    description:
      "Returns GMT in datetime format with the Daylight Saving Time by local time of the computer, where the client terminal is running",
  },
  TimeGMTOffset: {
    args: [],
    returnType: "int",
    description:
      "Returns the current difference between GMT time and the local computer time in seconds, taking into account DST switch",
  },
  TimeHour: {
    args: [],
    returnType: "int",
    description: "Returns the hour of the specified time",
  },
  TimeLocal: {
    args: [],
    returnType: "datetime",
    description: "Returns the local computer time in datetime format",
  },
  TimeMinute: {
    args: [],
    returnType: "int",
    description: "Returns the minute of the specified time",
  },
  TimeMonth: {
    args: [],
    returnType: "int",
    description: "Returns the month number of the specified time",
  },
  TimeSeconds: {
    args: [],
    returnType: "int",
    description:
      "Returns the amount of seconds elapsed from the beginning of the minute of the specified time",
  },
  TimeToStruct: {
    args: [
      { name: "dt", type: "datetime", optional: false },
      { name: "dt_struct", type: "MqlDateTime", optional: false },
    ],
    returnType: "bool",
    description: "Converts a datetime value into a variable of MqlDateTime structure type",
  },
  TimeYear: {
    args: [],
    returnType: "int",
    description: "Returns year of the specified date",
  },
  Year: {
    args: [],
    returnType: "int",
    description: "Returns the current year, i.e., the year of the last known server time",
  },
};
