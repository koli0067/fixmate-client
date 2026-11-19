import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.MONGODB_URL as string);
const db = client.db("fixmate");

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  database: mongodbAdapter(db, {
    client,
    // Standalone MongoDB doesn't support transactions; keep this off so
    // sign-up/sign-in works on both local and Atlas setups.
    transaction: false,
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: true,
      },
      phone: { type: "string", required: false, input: true },
      area: { type: "string", required: false, input: true },
      bio: { type: "string", required: false, input: true },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Only customer/technician can sign up. Anything else becomes customer.
          if (user.role !== "technician") {
            user.role = "customer";
          }
          return { data: user };
        },
      },
      update: {
        before: async (user) => {
          // Role must not be changed through profile updates.
          if (Object.prototype.hasOwnProperty.call(user, "role")) {
            const next = { ...user };
            delete next.role;
            return { data: next };
          }
          return { data: user };
        },
      },
    },
  },
});