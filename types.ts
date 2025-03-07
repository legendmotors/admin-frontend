// types.ts

// A generic interface for your select dropdown options
export interface SelectOption {
  value: string;
  label: string;
}

// --- Primary Entities ---

export interface Brand {
  id: number;
  name: string;
}

export interface CarModel {
  id: number;
  name: string;
}

export interface Trim {
  id: number;
  name: string;
}

export interface Year {
  id: number;
  year: number;
}

// --- File and Media Types ---

export interface FileSystem {
  id: string;
  name: string;
  isDirectory?: boolean;
  path: string;
  parentId?: number | null;
  size?: number;
  mimeType?: string;
  originalPath?: string;
  compressedPath?: string;
  thumbnailPath?: string;
  webpPath?: string;
  createdAt?: string;
  updatedAt?: string;
}

// --- Car Image, Price, and Translation ---

export interface CarImage {
  id: number;
  fileId: string;
  type: string;
  order: number;
  FileSystem?: FileSystem;
}

export interface CarPrice {
  id: number;
  currency: string;
  price: string; // or number if your API returns numeric
}

export interface CarTranslation {
  id: number;
  language: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

// --- Tags ---

export interface Tag {
  id: number;
  name: string;
}

// --- Feature Related Types ---

export interface Feature {
  id: number;
  name: string;
  key?: string;
  status?: 'draft' | 'published';
  mandatory?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeatureValue {
  id: number;
  name: string;
  Feature?: Feature;
  createdAt?: string;
  updatedAt?: string;
}

// --- Specification Related Types ---

export interface Specification {
  id: number;
  name: string;
  key: string;
  status?: 'draft' | 'published';
  mandatory?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SpecificationValue {
  id: number;
  name: string;
  slug?: string;
  status?: 'draft' | 'published';
  Specification?: Specification;
  createdAt?: string;
  updatedAt?: string;
}

// --- Car Object ---

export interface Car {
  id: number;
  stockId: string;
  description?: string;
  status: 'draft' | 'published';
  brochureId?: string | null;
  yearId: number;
  engineSize?: number;
  horsepower?: number;
  createdAt?: string;
  updatedAt?: string;
  brandId?: number;
  modelId?: number;
  trimId?: number;
  additionalInfo?: string;
  // Associations
  Brand: Brand;
  CarModel: CarModel;
  Trim: Trim;
  Year: Year;
  CarTranslations?: CarTranslation[];    // if multiple translations
  CarImages: CarImage[];
  CarPrices: CarPrice[];
  Tags: Tag[];
  FeatureValues?: FeatureValue[];
  SpecificationValues?: SpecificationValue[];
  
  // The brochure file (if present)
  brochureFile?: FileSystem | null;
}
