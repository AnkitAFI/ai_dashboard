export interface CompetitorInput {
  ownAsin: string;
  competitorAsins: string[];
}

export interface ProductData {
  asin: string;
  mrp: number | null;
  price: number | null;
  buyBoxWinner: string | null;
  sellerName: string | null;
  isFba: boolean | null;
  delivery110011: string | null;
  coupons: string | null;
  bankOffers: string[] | null;
  status: 'idle' | 'pending' | 'loading' | 'success' | 'error';
  errorMsg?: string;
}

export interface ComparisonRow {
  ownProduct: ProductData;
  competitors: ProductData[];
}
