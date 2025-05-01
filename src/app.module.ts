import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PatientRecordModule } from "./patient-record/patient-record.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: "postgres",
          host: configService.get("DATABASE_HOST", "localhost"),
          port: configService.get<number>("DATABASE_PORT", 5432),
          username: configService.get("DATABASE_USER", "turbovets"),
          password: configService.get("DATABASE_PASSWORD", "turbovets"),
          database: configService.get("DATABASE_DB", "turbovets"),
          entities: [__dirname + "/../**/*.entity{.ts,.js}"],
          synchronize: configService.get("NODE_ENV") !== "production",
        };
      },
    }),
    PatientRecordModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
