import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity()
@Unique('unique_video', ['videoId'])
export class VideoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  channelId: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  videoId: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  url: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  image: string;

  @Column({ type: 'boolean', nullable: true, default: null })
  isLive: boolean;

  @Column({ type: 'boolean', nullable: true, default: null })
  stream: boolean;
}
