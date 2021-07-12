import React, { useState } from "react";
import { Stock } from "./App";

interface StockListProps {
  stocks: Stock[];
  tickerExists: (ticker: string) => boolean;
  removeTicker: (ticker: string) => void;
  addTicker: (ticker: string, weight: number) => void;
  editWeight: (index: number, weight: number) => void;
}

export const StockList: React.FC<StockListProps> = (props) => {
  const { stocks, tickerExists, addTicker, editWeight, removeTicker } = props;

  const [currentTicker, setCurrentTicker] = useState<string>("");
  const [currentWeight, setCurrentWeight] = useState<number>();

  const getSummedWeights = (): number => {
    return stocks.reduce((prev, stock) => stock.weight + prev, 0);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {stocks.map((stock, index) => (
        <div key={stock.ticker}>
          <input value={stock.ticker} disabled />
          <input
            placeholder="%"
            type="number"
            min={0.01}
            max={100 - getSummedWeights()}
            value={stock.weight}
            onChange={(e) => {
              editWeight(index, e.currentTarget.valueAsNumber);
            }}
          />
          <button onClick={() => removeTicker(stock.ticker)}>X</button>
        </div>
      ))}
      <div>
        {getSummedWeights() < 100 ? (
          <>
            <input
              value={currentTicker}
              onChange={(e) =>
                setCurrentTicker(e.currentTarget.value.toUpperCase())
              }
              placeholder="e.g. TSLA, AAPL, GME"
            />
            <input
              placeholder="%"
              type="number"
              min={0.01}
              max={100 - getSummedWeights()}
              value={currentWeight ?? ""}
              onChange={(e) => {
                setCurrentWeight(
                  !isNaN(e.currentTarget.valueAsNumber)
                    ? e.currentTarget.valueAsNumber
                    : undefined
                );
              }}
            />
            <button
              onClick={() => {
                if (
                  !currentTicker.length ||
                  tickerExists(currentTicker) ||
                  !currentWeight
                ) {
                  return;
                }
                if (currentWeight + getSummedWeights() > 100) {
                  alert(
                    `The maximum weighting possible is ${
                      100 - getSummedWeights()
                    }%`
                  );
                  return;
                }

                addTicker(currentTicker, currentWeight);
                setCurrentTicker("");
                setCurrentWeight(undefined);
              }}
            >
              +
            </button>
          </>
        ) : (
          <div>Your portfolio is at 100% weighting</div>
        )}
      </div>
    </div>
  );
};
