import * as fs from "fs";

interface Forecast {
  dates: string[];
  opens: number[];
  closes: number[];
  highs: number[];
  lows: number[];
  adjCloses: number[];
  volumes: number[];
}

try {
  const data = fs.readFileSync("test.json", "utf-8");
  const response = JSON.parse(data);
  const { forecast } = response;

  // Function to convert date to YYYY-MM-DD format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };
  const dates = Object.values(forecast["Date"]).map(value => String(value))
  console.log(dates)
  dates.forEach((value: string, index: number) => {
    dates[index] = formatDate(value);
  });

  const predictions: Forecast = {
    dates: dates,
    opens: Object.values(forecast["Open"]).map(value => Number(value)),
    closes: Object.values(forecast["Close"]).map(value => Number(value)),
    highs: Object.values(forecast["High"]).map(value => Number(value)),
    lows: Object.values(forecast["Low"]).map(value => Number(value)),
    adjCloses: Object.values(forecast["Adj Close"]).map(value => Number(value)),
    volumes: Object.values(forecast["Volume"]).map(value => Number(value)),
  };
  console.log(predictions.dates);
} catch (error) {
  console.error("Error reading or parsing the file:", error);
}
