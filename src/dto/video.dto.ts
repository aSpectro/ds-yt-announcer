export interface VideoDTO {
  id?: string;
  channelId: string;
  videoId: string;
  url: string;
  description: string;
  image: string;
  isLive?: boolean | null;
  stream?: boolean | null;
}
