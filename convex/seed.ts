import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

// Seed demo data for the app
export const seedDemoData = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Check if already seeded
    const existingVehicles = await ctx.db.query("vehicles").collect();
    if (existingVehicles.length > 0) return null;

    // Seed vehicles
    const v1 = await ctx.db.insert("vehicles", {
      name: "Van Alpha",
      type: "van",
      capacity: 12,
      licensePlate: "MD-WR-001",
      status: "active",
      currentLat: 39.2904,
      currentLng: -76.6122,
      lastLocationUpdate: Date.now(),
    });
    const v2 = await ctx.db.insert("vehicles", {
      name: "Van Bravo",
      type: "van",
      capacity: 15,
      licensePlate: "MD-WR-002",
      status: "active",
      currentLat: 39.2037,
      currentLng: -76.8610,
      lastLocationUpdate: Date.now(),
    });
    const v3 = await ctx.db.insert("vehicles", {
      name: "Van Charlie",
      type: "minibus",
      capacity: 20,
      licensePlate: "MD-WR-003",
      status: "active",
      currentLat: 39.1024,
      currentLng: -76.8375,
      lastLocationUpdate: Date.now(),
    });
    await ctx.db.insert("vehicles", {
      name: "Van Delta",
      type: "van",
      capacity: 12,
      licensePlate: "MD-WR-004",
      status: "maintenance",
    });

    // Seed routes
    await ctx.db.insert("routes", {
      name: "Baltimore Downtown → Amazon BWI5",
      description: "Morning route from downtown Baltimore to Amazon warehouse",
      origin: "Baltimore Downtown",
      destination: "Amazon BWI5, Sparrows Point",
      serviceArea: "Baltimore",
      shift: "morning",
      departureTime: "5:30 AM",
      returnTime: "4:00 PM",
      vehicleId: v1,
      status: "active",
      stops: [
        { name: "Baltimore Penn Station", lat: 39.3076, lng: -76.6157, order: 1 },
        { name: "Inner Harbor", lat: 39.2866, lng: -76.6088, order: 2 },
        { name: "Dundalk", lat: 39.2507, lng: -76.5207, order: 3 },
        { name: "Amazon BWI5", lat: 39.2261, lng: -76.4778, order: 4 },
      ],
    });
    await ctx.db.insert("routes", {
      name: "Columbia → FedEx Ground Jessup",
      description: "Early morning shift to FedEx Ground hub",
      origin: "Columbia",
      destination: "FedEx Ground, Jessup",
      serviceArea: "Columbia",
      shift: "morning",
      departureTime: "4:00 AM",
      returnTime: "2:30 PM",
      vehicleId: v2,
      status: "active",
      stops: [
        { name: "Columbia Mall Area", lat: 39.2037, lng: -76.8610, order: 1 },
        { name: "Elkridge", lat: 39.2126, lng: -76.7136, order: 2 },
        { name: "FedEx Ground Jessup", lat: 39.1431, lng: -76.7766, order: 3 },
      ],
    });
    await ctx.db.insert("routes", {
      name: "Silver Spring → Amazon DCA6",
      description: "Afternoon shift route",
      origin: "Silver Spring",
      destination: "Amazon DCA6, Baltimore",
      serviceArea: "Silver Spring",
      shift: "afternoon",
      departureTime: "1:30 PM",
      returnTime: "12:00 AM",
      vehicleId: v3,
      status: "active",
      stops: [
        { name: "Silver Spring Metro", lat: 38.9940, lng: -77.0311, order: 1 },
        { name: "Laurel", lat: 39.0993, lng: -76.8483, order: 2 },
        { name: "Amazon DCA6", lat: 39.2570, lng: -76.5639, order: 3 },
      ],
    });

    // Seed site settings (pricing)
    const defaultSettings = [
      { key: "price_monthly_min", value: "280" },
      { key: "price_monthly_max", value: "350" },
      { key: "price_biweekly_min", value: "155" },
      { key: "price_biweekly_max", value: "175" },
      { key: "price_weekly", value: "50" },
      { key: "price_daily_min", value: "17" },
      { key: "price_daily_max", value: "22" },
      { key: "min_passengers", value: "8" },
    ];
    for (const s of defaultSettings) {
      await ctx.db.insert("siteSettings", s);
    }

    return null;
  },
});
