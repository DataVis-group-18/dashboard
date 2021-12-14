import * as d3 from "d3";
import { Margin, Organisation } from "./types";

export function drawLeftPlot(organisations: d3.DSVParsedArray<Organisation>) {
  // set the dimensions and margins of the graph
  const svg = d3
    .select("svg#left-plot")
    .append("g")
    .attr("transform", `translate(160, 0)`);
  let [width, height] = new Margin(0, 20, 50, 160).dimensions("svg#left-plot");

  const subgroups = [
    "sev1",
    "sev2",
    "sev3",
    "sev4",
    "sev5",
    "sev6",
    "sev7",
    "sev8",
    "sev9",
    "sev10",
  ];

  //stack the data? --> stack per subgroup
  /// @ts-ignore
  organisations.sort((a, b) => b.total() - a.total());

  const stackedData = d3.stack().keys(subgroups)(organisations);

  const groups = organisations.map((d) => d.name);
  

  const x = d3.scaleLinear().domain([0, 8000]).range([0, width]);
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  // Add Y axis
  const y = d3.scaleBand().domain(groups).range([10, height]).padding(0.1);
  svg
    .append("g")
    .attr("transform", `translate(0, ${width}+${width})`)
    .call(d3.axisLeft(y).tickSizeOuter(0).tickFormat((x) => shortenText(x, 30)))
    .selectAll("text")
    .style("text-anchor", "end");

  // color palette = one color per subgroup
  const color = d3
    .scaleOrdinal<string>()
    .domain(subgroups.reverse())
    .range(d3.schemeSpectral[10]);

  // Show the bars
  svg
    .append("g")
    .attr("transform", `translate(1, 0)`)
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .join("g")
    .attr("fill", (d) => color(d.key))
    .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    .data((d) => d)
    .join("rect")
    .attr("x", (d) => x(d[0]))
    .attr("y", (d) => y(d.data.name as unknown as string)!)
    .attr("width", (d) => x(d[1]) - x(d[0]))
    .attr("height", y.bandwidth());
}

function shortenText(text: string, maxLength: number): string {
    if (text.length > maxLength) {
        return text.slice(0, maxLength-2) + "...";
    } else {
        return text;
    }
}