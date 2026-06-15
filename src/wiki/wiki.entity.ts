import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('wiki_documents')
export class WikiDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string; // The raw or markdown structured content

  @Column('text', { array: true, default: [] })
  entities: string[];

  // vector column for embeddings
  // dimensions depend on the model (e.g. 1024 for Xenova/bge-m3, or 768, 384)
  // Xenova/bge-m3 outputs 1024 dimensions.
  @Column('vector', { length: 1024, nullable: true })
  embedding: number[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
