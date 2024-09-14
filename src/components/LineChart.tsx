import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "../Chat.css";

interface Forecast {
  dates: string[];
  opens: number[];
  closes: number[];
  highs: number[];
  lows: number[];
  adjCloses: number[];
  volumes: number[];
}

interface LineChartProps {
  forecast: Forecast;
  width?: number;
  height?: number;
}

// const LineChart: React.FC<LineChartProps> = ({ forecast }) => {
//   //   const { dates, opens, closes, highs, lows, adjCloses, volumes } = forecast;

//   useEffect(() => {
//     const data = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

//     const svg = d3
//       .select("#chart")
//       .append("svg")
//       .attr("width", "100%") // Responsive width
//       .attr("height", "100%") // Responsive height
//       .attr("viewBox", `0 0 800 400`) // Aspect ratio scaling
//       .attr("preserveAspectRatio", "xMidYMid meet");

//     // Set up your x and y scales
//     const xScale = d3
//       .scaleLinear()
//       .domain([0, data.length - 1])
//       .range([0, 800]);
//     const yScale = d3.scaleLinear().domain([0, 100]).range([400, 0]);

//     // Create a line generator
//     const line = d3
//       .line<number>()
//       .x((d, i) => xScale(i))
//       .y((d) => yScale(d));

//     // Append the line path to the SVG
//     svg
//       .append("path")
//       .datum(data)
//       .attr("fill", "none")
//       .attr("stroke", "blue")
//       .attr("stroke-width", 2)
//       .attr("d", line);
//   }, [forecast]);

//   return <div id="chart" style={{ width: "100%", height: "400px" }} />;
// };

const LineChart: React.FC<LineChartProps> = ({
  forecast,
  width = 800,
  height = 400,
}) => {
  const { dates, opens, closes, highs, lows, adjCloses, volumes } = forecast;
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!dates.length || !closes.length || !svgRef.current) return;

    // Convert dates to Date objects
    const data = dates.map((d, i) => ({ date: new Date(d), value: closes[i] }));

    // Set up margins and dimensions
    const margin = { top: 0, right: 0, bottom: 25, left: 35 };
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

    // Line generator
    const line = d3
      .line<{ date: Date; value: number }>()
      .x((d) => x(d.date))
      .y((d) => y(d.value));

    // Append the line to the chart
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line);
  }, [forecast, width, height]);

  return (
    <div className="chart">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 800 400"
        // preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
};

export default LineChart;
