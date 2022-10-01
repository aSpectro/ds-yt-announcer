import { Injectable } from '@nestjs/common';
import { configService } from './config/config.service';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelEntity } from './entities/channel.entity';
import { ChannelDTO } from './dto/channel.dto';
import { VideoEntity } from './entities/video.entity';
import { VideoDTO } from './dto/video.dto';
import * as moment from 'moment';
import axios from 'axios';
import config from './commands/config';

const channelId = configService.getChannel();

@Injectable()
export class AppService {
  client: any;
  constructor(
    @InjectRepository(ChannelEntity)
    private channelRepository: Repository<ChannelEntity>,

    @InjectRepository(VideoEntity)
    private videoRepository: Repository<VideoEntity>,
  ) {}

  setClient(client: any) {
    this.client = client;
  }

  checkChannel(
    channelId: string,
  ): Promise<{ status: number; channel?: ChannelDTO }> {
    return new Promise(async (resolve, reject) => {
      try {
        const channel: ChannelDTO = await this.channelRepository.findOne({
          where: { channelId },
        });

        if (channel) {
          resolve({ status: 200, channel });
        } else {
          resolve({ status: 400 });
        }
      } catch (error) {
        console.log(error);
      }
    });
  }

  createChannel(channel: ChannelDTO): Promise<{ status: number }> {
    return new Promise(async (resolve, reject) => {
      const channelRow: ChannelDTO = new ChannelEntity();
      Object.assign(channelRow, {
        ...channel,
      });

      try {
        await this.channelRepository.save(
          this.channelRepository.create(channelRow),
        );
        resolve({ status: 200 });
      } catch (error) {
        resolve({ status: 400 });
      }
    });
  }

  saveChannel(channel: ChannelDTO): Promise<{ status: number }> {
    return new Promise(async (resolve, reject) => {
      try {
        const channelRow: ChannelDTO = channel;
        await this.channelRepository.save(channelRow);
        resolve({ status: 200 });
      } catch (error) {
        resolve({ status: 400 });
      }
    });
  }

  deleteChannel(channelId: string): Promise<{ status: number }> {
    return new Promise(async (resolve, reject) => {
      try {
        const channel: ChannelDTO = await this.channelRepository.findOne({
          where: { channelId },
        });

        if (channel) {
          await this.channelRepository.delete(channel);
          resolve({ status: 200 });
        } else {
          resolve({ status: 400 });
        }
      } catch (error) {
        console.log(error);
      }
    });
  }

  async sendBotEvent(video: VideoDTO) {
    let eventType = 'video';
    if (video.stream && video.isLive) {
      eventType = 'live';
    } else if (video.stream && !video.isLive) {
      eventType = 'announcement';
    }

    const videoId: string = video.videoId;
    const url = config.dataUrls.youtubeOembed(videoId);
    const videoUrl = config.dataUrls.youtubeVideo(videoId);
    const dataOembed: any = (await axios.get(url)).data;
    let msg = '';
    if (eventType === 'announcement') {
      msg = `📆 ${dataOembed.author_name}\nАнонс стрима: ${videoUrl}`;
    } else if (eventType === 'video') {
      msg = `📺 ${dataOembed.author_name}\nВышло новое видео: ${videoUrl}`;
    } else {
      msg = `🔴 ${dataOembed.author_name}\nСтрим начался: ${videoUrl}`;
    }

    this.client.channels
      .fetch(channelId)
      .then((channel: any) => {
        channel.send(msg);
      })
      .catch(console.error);
  }

  async getVideoInfo(videoId: string, channelId: string): Promise<any> {
    const videoObject: any = await this.videoRepository.find({
      where: [{ videoId: videoId }],
    });

    if (videoObject.length === 0) {
      const vData: any = await axios.get(
        config.dataUrls.youtubeVideoInfo(videoId, config.yt_api_key),
      );

      if (vData.data.items.length > 0) {
        let isStream = false;
        let isOffline = false;
        if (vData.data.items[0].snippet.liveBroadcastContent === 'upcoming') {
          isStream = true;
        } else if (
          vData.data.items[0].snippet.liveBroadcastContent === 'live'
        ) {
          isStream = true;
          isOffline = true;
        }

        const newLive = new VideoEntity();
        Object.assign(newLive, {
          id: null,
          channelId: channelId,
          videoId: videoId,
          url: config.dataUrls.youtubeVideo(videoId),
          description: vData.data.items[0].snippet.title,
          image: vData.data.items[0].snippet.thumbnails.maxres.url,
          isLive: isOffline,
          stream: isStream,
        });

        await this.videoRepository.save(newLive);
        await this.sendBotEvent(newLive);
      }
    }
  }

  @Cron('0 * * * * *')
  async checkStreamsStatus() {
    const streams: any = await this.videoRepository.find({
      where: [
        { isLive: false, stream: true },
        { isLive: true, stream: true },
      ],
    });

    const ids = streams.map((m) => m.videoId).join(',');
    let vData: any = [];

    if (streams.length > 0) {
      const data: any = await axios.get(
        config.dataUrls.youtubeVideoInfo(ids, config.yt_api_key),
      );
      vData = data.data.items;
    }

    for (const videoObject of vData) {
      const dbVideoObject = streams.find((f) => f.videoId === videoObject.id);
      if (dbVideoObject) {
        const currentLive = new VideoEntity();
        if (
          !dbVideoObject.isLive &&
          videoObject.snippet.liveBroadcastContent === 'live'
        ) {
          const obj = { isLive: true };
          Object.assign(currentLive, {
            ...dbVideoObject,
            ...obj,
          });

          await this.videoRepository.save(currentLive);
          await this.sendBotEvent(currentLive);
        } else if (
          dbVideoObject.isLive &&
          videoObject.snippet.liveBroadcastContent !== 'live'
        ) {
          const obj = { isLive: false, stream: false };
          Object.assign(currentLive, {
            ...dbVideoObject,
            ...obj,
          });

          await this.videoRepository.save(currentLive);
        }
      }
    }
  }

  @Cron('0 0 1 * * *')
  async autoUpdateSubs() {
    const channels: ChannelDTO[] = await this.channelRepository.find();
    const requests = [];
    for (let i = 0; i < channels.length; i++) {
      const url = 'https://pubsubhubbub.appspot.com/subscribe';
      const formData = new URLSearchParams({
        'hub.callback': config.dataUrls.callback,
        'hub.topic': `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${channels[i].channelId}`,
        'hub.verify': 'async',
        'hub.mode': 'subscribe',
        'hub.verify_token': '',
        'hub.secret': '',
        'hub.lease_seconds': '',
      });

      requests.push(axios.post(url, formData));
    }

    Promise.all(requests)
      .then(() => {
        console.log('Обновлены подписки на каналы');
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
