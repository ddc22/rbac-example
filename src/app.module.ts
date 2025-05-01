import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { PatientRecordModule } from "./patient-record/patient-record.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PermissionGuardService } from "./cross-cutting-aspects/auth/permission.guard";
import { GlobalModule } from "./cross-cutting-aspects/global/global.module";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { FakeLoginInterceptor } from "./cross-cutting-aspects/auth/fake-login.interceptor";
import { PatientRecordService } from "./patient-record/services/patient-record/patient-record.service";

@Module({
  imports: [
    GlobalModule,
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
          entities: [__dirname + "/**/*.{ts,js}"],
        };
      },
    }),

    PatientRecordModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: FakeLoginInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuardService,
    },
  ],
})
export class AppModule {}
