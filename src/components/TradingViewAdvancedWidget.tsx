import React, { useEffect, useRef } from "react";
import { widget } from "../charting_library.d.ts";
import { Datafeed } from "../utils/datafeed";

interface TradingViewChartProps {
  symbol: string;
  interval?: string;
}

const TradingViewAdvancedWidget: React.FC<TradingViewChartProps> = ({
  symbol = "RISH/USDC",
  interval = "15",
}) => {
  const containerRef = useRef<string>(`tv_chart_${Date.now()}`);
  const tvWidgetRef = useRef<any>(null);

  useEffect(() => {
    const widgetOptions = {
      symbol,
      datafeed: Datafeed,
      interval,
      container: containerRef.current,
      library_path: "/charting_library/",
      locale: "en",
      disabled_features: ["use_localstorage_for_settings"],
      enabled_features: ["study_templates"],
      charts_storage_url: "https://saveload.tradingview.com",
      charts_storage_api_version: "1.1",
      client_id: "tradingview.com",
      user_id: "public_user",
      fullscreen: false,
      autosize: true,
      theme: "Dark",
      overrides: {
        "mainSeriesProperties.candleStyle.upColor": "#26a69a",
        "mainSeriesProperties.candleStyle.downColor": "#ef5350",
        "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
        "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350",
      },
    };

    tvWidgetRef.current = new widget(widgetOptions);

    return () => {
      if (tvWidgetRef.current !== null) {
        tvWidgetRef.current.remove();
        tvWidgetRef.current = null;
      }
    };
  }, [symbol, interval]);

  return <div id={containerRef.current} className="w-full h-[600px]" />;
};

export default TradingViewAdvancedWidget;
