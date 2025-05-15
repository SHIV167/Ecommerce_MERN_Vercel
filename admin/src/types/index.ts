export interface Blog {
  _id: string;
  title: string;
  slug: string;
  author: string;
  publishedAt: string;
  summary: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  _id: string;
  name: string;
  email: string;
  country: string;
  mobile: string;
  comments: string;
  createdAt: string;
}
