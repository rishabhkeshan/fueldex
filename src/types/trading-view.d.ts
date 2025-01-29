declare module "charting_library/charting_library" {
  export interface ChartingLibraryWidgetOptions {
    symbol: string;
    interval: string;
    libraryPath: string;
    chartsStorageUrl: string;
    chartsStorageApiVersion: string;
    clientId: string;
    userId: string;
    fullscreen: boolean;
    autosize: boolean;
    studiesOverrides: object;
    container: string;
    datafeed: any;
  }

  export class widget {
    constructor(options: ChartingLibraryWidgetOptions);
    onChartReady(callback: () => void): void;
    setSymbol(symbol: string, interval: string, callback: () => void): void;
  }
}
