import Admin from "../models/Admin";

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const DEFAULT_ADMIN_NAME = process.env.ADMIN_NAME || "Admin";

export const seedAdmin = async (): Promise<void> => {
  try {
    const existingAdmin = await Admin.findOne({ email: DEFAULT_ADMIN_EMAIL });

    if (!existingAdmin) {
      await Admin.create({
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD,
        name: DEFAULT_ADMIN_NAME,
        role: "superadmin",
      });
      console.log(
        `[Seed] Default admin created: ${DEFAULT_ADMIN_EMAIL} / ${DEFAULT_ADMIN_PASSWORD}`,
      );
    } else {
      console.log("[Seed] Admin already exists, skipping seed");
    }
  } catch (error) {
    console.error("[Seed] Error creating default admin:", error);
  }
};
