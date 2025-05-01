import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";
import { join } from "path";

// Load .env file
config();

const configService = new ConfigService();

export default new DataSource({
  type: "postgres",
  host: configService.get("DATABASE_HOST", "localhost"),
  port: configService.get<number>("DATABASE_PORT", 5432),
  username: configService.get("DATABASE_USER", "turbovets"),
  password: configService.get("DATABASE_PASSWORD", "turbovets"),
  database: configService.get("DATABASE_DB", "turbovets"),
  entities: [join(__dirname, "..", "**", "*.entity{.ts,.js}")],
  migrations: [join(__dirname, "scripts", "*{.ts,.js}")],
  migrationsTableName: "migrations",
  // Set synchronize to false for the datasource used for migrations
  synchronize: false,
});
