import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configService } from './config/config.service';

import { ChannelEntity } from './entities/channel.entity';
import { VideoEntity } from './entities/video.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    TypeOrmModule.forFeature([ChannelEntity, VideoEntity]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
