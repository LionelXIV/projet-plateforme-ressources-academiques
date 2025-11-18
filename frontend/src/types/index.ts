export interface Document {
  id: number;
  name: string;
  type: string;
  size: string;
  url?: string;
   file?: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  fullDescription: string;
  instructor: string;
  category: string;
  level: string;
  image: string;
  publishedAt: string;
  documents: Document[];
}
