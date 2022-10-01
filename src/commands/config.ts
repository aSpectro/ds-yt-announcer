import { configService } from './../config/config.service';

export default {
  admin: configService.getAdminId(),
  bot: {
    token: configService.getToken(),
    prefix: configService.isProduction() ? configService.getPrefix() : '.', // префикс бота prod/dev
    rpc: '/ᐠ｡ꞈ｡ᐟ\\',
    botId: configService.getClientId(),
    clientId: configService.getClientId(),
    badgeColor: '#f97a50',
    dslink: `https://discord.com/oauth2/authorize?client_id=${configService.getClientId()}&scope=bot&permissions=17179878400`,
  },
  yt_api_key: configService.getApiKey(),
  dataUrls: {
    youtubeChannel: (channelId) => {
      return `https://www.youtube.com/channel/${channelId}`;
    },
    youtubeChannelLive: (channelId) => {
      return `https://www.youtube.com/channel/${channelId}/live`;
    },
    youtubeRSS: (channelId) => {
      return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    },
    youtubeOembed: (videoId) => {
      return `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    },
    youtubeCheckLives: (channelId, apiKey) => {
      return `https://www.googleapis.com/youtube/v3/activities?part=snippet&channelId=${channelId}&type=video&eventType=live&key=${apiKey}`;
    },
    youtubeVideo: (videoId) => {
      return `https://www.youtube.com/watch?v=${videoId}`;
    },
    youtubeVideoInfo: (videoId, apiKey) => {
      return `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
    },
    callback: `http://${configService.getIp()}:${configService.getPort()}/live`,
  },
};
