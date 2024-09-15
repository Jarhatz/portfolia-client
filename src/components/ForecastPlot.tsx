import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./ForecastPlot.css";

interface Forecast {
  dates: string[];
  opens: number[];
  closes: number[];
  highs: number[];
  lows: number[];
  adjCloses: number[];
  volumes: number[];
}

interface ForecastComponentProps {
  symbol?: string;
  forecast: Forecast;
}

const ForecastPlot: React.FC<ForecastComponentProps> = ({
  symbol,
  forecast,
}) => {
  const { dates, opens, closes, highs, lows, adjCloses, volumes } = forecast;
  const numDays = (dates.length - 1) / 5;
  const [selectedName, setSelectedName] = useState("Close");
  const [selectedMode, setSelectedMode] = useState(closes);

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;

    switch (selected) {
      case "Close":
        setSelectedName("Close");
        setSelectedMode(closes);
        break;
      case "Open":
        setSelectedName("Open");
        setSelectedMode(opens);
        break;
      case "High":
        setSelectedName("High");
        setSelectedMode(highs);
        break;
      case "Low":
        setSelectedName("Low");
        setSelectedMode(lows);
        break;
      case "Adjacent Close":
        setSelectedName("Adjacent Close");
        setSelectedMode(adjCloses);
        break;
      case "Volume":
        setSelectedName("Volume");
        setSelectedMode(volumes);
        break;
      default:
        setSelectedName("Close");
        setSelectedMode(closes);
        break;
    }
  };

  return (
    <div className="fcp-container">
      <div className="fcp-header">
        <p className="fcp-header-text">
          {symbol} - {numDays} Day Stock Forecast
        </p>
        <select className="fcp-dropdown" onChange={handleDropdownChange}>
          <option value="Close">Close Price</option>
          <option value="Open">Open Price</option>
          <option value="High">High Price</option>
          <option value="Low">Low Price</option>
          <option value="Adjacent Close">Adjacent Close</option>
          <option value="Volume">Volume</option>
        </select>
      </div>
      <div className="fcp-chart">
        <Plot name={selectedName} dates={dates} values={selectedMode} predictionLength={numDays} />
      </div>
    </div>
  );
};

interface PlotProps {
  name: string;
  dates: string[];
  values: number[];
  predictionLength: number;
  width?: number;
  height?: number;
}

const Plot: React.FC<PlotProps> = ({
  name,
  dates,
  values,
  predictionLength,
  width = 800,
  height = 400,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoverData, setHoverData] = useState<{
    date: Date;
    value: number;
  } | null>(null);

  useEffect(() => {
    if (!dates.length || !values.length || !svgRef.current) return;

    // Convert dates to Date objects
    const data = dates.map((d, i) => ({ date: new Date(d), value: values[i] }));

    // Split data into actual and predicted parts
    const actualData = data.slice(0, -predictionLength);
    const predictionData = data.slice(-predictionLength - 1);

    // Determine the color of the prediction line (green or red)
    const lastActualValue = actualData[actualData.length - 1]?.value;
    const lastPredictionValue =
      predictionData[predictionData.length - 1]?.value;
    const predictionColor =
      lastPredictionValue > lastActualValue ? "green" : "red";

    // Set up margins and dimensions
    let marginLeft = 50
    if (name === "Volume") {
      marginLeft = 100
    }
    const margin = { top: 0, right: 0, bottom: 50, left: marginLeft };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create scales
    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date) as [Date, Date])
      .range([0, chartWidth]);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.value)! - 5,
        d3.max(data, (d) => d.value)! + 5,
      ])
      .range([chartHeight, 0]);

    // Clear any previous drawing in the SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create a group to apply margins
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create and append x-axis
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y-%m-%d")));

    // Create and append y-axis
    g.append("g").call(d3.axisLeft(y));

    // Add x-axis label (Date)
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", chartWidth / 2 + margin.left) // Position in the middle of the chart
      .attr("y", height) // Position slightly above the bottom of the SVG
      .text("Date")
      .attr("font-size", "12px")
      .attr("fill", "white");

    // Add y-axis label (Price)
    let yLabel = "Price"
    if (name === "Volume") {
      yLabel = "Quantity"
    }
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${10},${chartHeight / 2})rotate(-90)`) // Rotate the text
      .text(yLabel)
      .attr("font-size", "12px")
      .attr("fill", "white");

    // Line generator
    const line = d3
      .line<{ date: Date; value: number }>()
      .x((d) => x(d.date))
      .y((d) => y(d.value));

    // Append the line for the actual data (blue)
    g.append("path")
      .datum(actualData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line);

    // Append the line for the prediction data (red or green)
    g.append("path")
      .datum(predictionData)
      .attr("fill", "none")
      .attr("stroke", predictionColor)
      .attr("stroke-width", 1.5)
      .attr("d", line);

    // Add a vertical dotted line at the last point of actual data
    const lastActualDate = actualData[actualData.length - 1]?.date;
    if (lastActualDate) {
      g.append("line")
        .attr("x1", x(lastActualDate))
        .attr("x2", x(lastActualDate))
        .attr("y1", 0)
        .attr("y2", chartHeight)
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4 2");
    }

    // Create elements for hover effect (vertical/horizontal lines and text)
    const hoverLineGroup = g.append("g").style("display", "none");

    const verticalLine = hoverLineGroup
      .append("line")
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("y1", 0)
      .attr("y2", chartHeight);

    const horizontalLine = hoverLineGroup
      .append("line")
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("x1", 0)
      .attr("x2", chartWidth);

    const hoverText = hoverLineGroup
      .append("text")
      .attr("fill", "white")
      .attr("text-anchor", "start")
      .attr("font-size", 12);

    // Add a rect to capture mouse events
    g.append("rect")
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("mousemove", function (event) {
        const [mouseX, _] = d3.pointer(event);
        const hoveredDate = x.invert(mouseX);

        // Find the closest data point to the hovered date
        const closestPoint = data.reduce((prev, curr) => {
          return Math.abs(curr.date.getTime() - hoveredDate.getTime()) <
            Math.abs(prev.date.getTime() - hoveredDate.getTime())
            ? curr
            : prev;
        });

        // Set hover data to display value
        setHoverData(closestPoint);

        // Update the hover lines and text
        hoverLineGroup.style("display", null);
        verticalLine
          .attr("x1", x(closestPoint.date))
          .attr("x2", x(closestPoint.date));
        horizontalLine
          .attr("y1", y(closestPoint.value))
          .attr("y2", y(closestPoint.value));
        hoverText
          .attr("x", x(closestPoint.date) + 5)
          .attr("y", y(closestPoint.value) - 5)
          .text(
            `Date: ${closestPoint.date.toLocaleDateString()}, Value: ${
              closestPoint.value
            }`
          );
      })
      .on("mouseout", function () {
        hoverLineGroup.style("display", "none");
        setHoverData(null);
      });
  }, [dates, values, predictionLength, width, height]);

  return (
    <div style={{ position: "relative" }}>
      <svg ref={svgRef} width="100%" viewBox="0 0 800 400" />
      {hoverData && (
        <div
          style={{
            position: "absolute",
            left: `${hoverData?.date ? 0 : "auto"}px`,
            bottom: "10px",
            background: "#000",
            padding: "4px",
            border: "1px solid #ddd",
            fontSize: "12px",
            pointerEvents: "none",
          }}
        >
          {`Date: ${hoverData.date.toLocaleDateString()}, Value: ${
            hoverData.value
          }`}
        </div>
      )}
    </div>
  );
};

export default ForecastPlot;
