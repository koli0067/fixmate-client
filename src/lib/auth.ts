
import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const uri = process.env.MONGODB_URL;

if (!uri) {
  throw new Error("MONGODB_URL is not defined");
}

// Reuse MongoDB connection across serverless invocations
const globalForMongo = globalThis as typeof globalThis & {
  mongoClient?: MongoClient;
  mongoClientPromise?: Promise<MongoClient>;
};

const client =
  globalForMongo.mongoClient ??
  new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 10000,
  });

if (!globalForMongo.mongoClient) {
  globalForMongo.mongoClient = client;
}

const clientPromise =
  globalForMongo.mongoClientPromise ??
  (globalForMongo.mongoClientPromise = client.connect().catch((error) => {
    globalForMongo.mongoClientPromise = undefined;
    throw error;
  }));

const db = client.db("fixmate");

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },

  database: mongodbAdapter(db, {
    client,
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
      phone: {
        type: "string",
        required: false,
        input: true,
      },
      area: {
        type: "string",
        required: false,
        input: true,
      },
      bio: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (user.role !== "technician") {
            user.role = "customer";
          }

          return { data: user };
        },
      },

      update: {
        before: async (user) => {
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

// Ensure connection is established
void clientPromise;