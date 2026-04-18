import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run shift reminders every 5 minutes
// Checks for customers whose shift starts in ~30 minutes and sends email + in-app notification
crons.interval(
  "send-shift-reminders",
  { minutes: 5 },
  internal.reminders.sendShiftReminders,
);

export default crons;
