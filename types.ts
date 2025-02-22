// types.ts (you could keep these in a separate file for clarity)

// A generic interface for your select dropdown options
export interface SelectOption {
    value: string;
    label: string;
  }
  
  // Example of the shape of your Car object
  // Adjust fields to match your actual API response
  export interface Car {
    id: number;
    stockId: string;
    Brand: {
      name: string;
    };
    CarModel: {
      name: string;
    };
    Year: {
      year: number;
    };
    Trim: {
      name: string;
    };
    CarImages: Array<{
      type: string;
      FileSystem?: {
        path: string;
      };
    }>;
    CarPrices: Array<{
      currency: string;
      price: number;
    }>;
    Tags: Array<{
      id: number;
      name: string;
    }>;
  }
  