import axios from "axios";
import { useMemo, useState } from "react";
import { Line as LineGraph } from "react-chartjs-2";
import { StockList } from "./StockList";

const getFormattedDate = (asOf: Date): string => {
  return asOf.toISOString().substr(0, 10);
};

interface ApiStockResponse {
  pagination: any[];
  data: ApiStock[];
}

interface ApiStock {
  adj_close: number;
  adj_high: number;
  adj_low: number;
  adj_open: number;
  adj_volume: number;
  close: number;
  date: string;
  exchange: string;
  high: number;
  low: number;
  open: number;
  symbol: string;
  volume: number;
}

export interface Stock {
  ticker: string;
  weight: number;
}

interface Portfolio {
  [date: string]: number;
}

function App() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [rawData, setRawData] = useState<ApiStock[]>([]);

  const resetState = () => {
    setStocks([]);
  };

  const addTicker = (ticker: string, weight: number): void => {
    setStocks((prevTickers) => [...prevTickers, { ticker, weight }]);
  };

  const removeTicker = (ticker: string): void => {
    setStocks((prevTickers) =>
      prevTickers.filter((currTicker) => currTicker.ticker !== ticker)
    );
  };

  const tickerExists = (ticker: string): boolean => {
    return !!stocks.find((currTicker) => currTicker.ticker === ticker);
  };

  const editWeight = (index: number, weight: number) => {
    const newStocks = stocks;
    newStocks[index] = { ...newStocks[index], weight };
    setStocks(newStocks);
  };

  const runQuery = () => {
    setRawData([]);
    if (!stocks.length) return;
    // if (!ALLOW_API_QUERY) return;

    const now = new Date();
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(now.getFullYear() - 5);

    const params = {
      access_key: "3fda2050c8ad6cdce15d6da1c685709d",
      symbols: stocks.map((stock) => stock.ticker).join(","),
      date_from: getFormattedDate(fiveYearsAgo),
      date_to: getFormattedDate(now),
      limit: 1000,
    };

    axios
      .get<ApiStockResponse>("http://api.marketstack.com/v1/eod", {
        params,
      })
      .then((response) => {
        // console.log(response.data.data);
        setRawData(response.data.data);
      })
      .catch((error) => console.log("dog cunts"));
  };

  const weightedIndex = useMemo(() => {
    const index: Portfolio = [] as any;

    for (let i = rawData.length - 1; i > 0; i--) {
      const dataPoint = rawData[i];
      const weight = stocks.find((stock) => stock.ticker === dataPoint.symbol)
        ?.weight;
      if (!weight) continue;
      const date = dataPoint.date.substr(0, 10);

      if (!index[date]) {
        index[date] = 0;
      }

      console.log(`Price: ${dataPoint.adj_close * (weight / 100)}`);

      index[date] = index[date] + dataPoint.adj_close * (weight / 100);
    }

    return index;
  }, [rawData, stocks]);

  console.log(rawData);
  console.log(weightedIndex);

  const indexDates = useMemo(() => Object.keys(weightedIndex), [weightedIndex]);

  return (
    <div style={{ margin: 20 }}>
      <div style={{ marginBottom: 5 }}>
        <button onClick={runQuery}>Query</button>
        <button onClick={resetState}>Reset</button>
      </div>

      <div style={{ marginBottom: 5 }}>
        <StockList
          stocks={stocks}
          removeTicker={removeTicker}
          tickerExists={tickerExists}
          addTicker={addTicker}
          editWeight={editWeight}
        />
      </div>

      <div>
        <LineGraph
          data={{
            labels: indexDates,
            datasets: [
              {
                label: `Portfolio Index`,
                fill: false,
                lineTension: 0.2,
                backgroundColor: "rgba(75,192,192,0.4)",
                borderColor: "rgba(75,192,192,1)",
                borderCapStyle: "butt",
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: "miter",
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: Object.values(weightedIndex) ?? [],
              },
            ],
          }}
        />
      </div>
    </div>
  );
}

export default App;
