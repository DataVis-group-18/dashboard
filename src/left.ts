import * as d3 from "d3";
import { ScaleOrdinal } from "d3";
import { Dimensions, Margin, Organisation } from "./types";

let selected: d3.Selection<any, unknown, any, any> | null = null;

export function drawLeftPlot(organisations: d3.DSVParsedArray<Organisation>) {
  // set the dimensions and margins of the graph
  const svg = d3
    .select("svg#left-plot")
    .append("g")
    .attr("transform", `translate(160, 0)`);
  const dim = new Dimensions(
    document.querySelector("svg#left-plot")!,
    new Margin(0, 20, 50, 160)
  );

  organisations.sort((a, b) => b.total() - a.total());

  const groups = organisations.map((d) => d.name);

  const x = d3.scaleLinear().domain([0, 8000]).range([0, dim.width]);
  svg
    .append("g")
    .attr("transform", `translate(0, ${dim.height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  // Add Y axis
  const y = d3.scaleBand().domain(groups).range([10, dim.height]).padding(0.1);
  svg
    .append("g")
    .attr("transform", `translate(0, ${dim.width}+${dim.width})`)
    .call(
      d3
        .axisLeft(y)
        .tickSizeOuter(0)
        .tickFormat((x) => shortenText(x, 30))
    )
    .selectAll("text")
    .style("text-anchor", "end");

  // color palette = one color per subgroup
  const color = d3.scaleOrdinal([...new Array(10).keys()].reverse(), d3.schemeSpectral[10]);

  // Show the bars
  svg
    .append("g")
    .attr("transform", `translate(1, 0)`)
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(organisations)
    .join("g")
    .attr("transform", (d) => `translate(0, ${y(d.name!)!})`)
    .selectAll("rect")
    .on("click", function () {
      selected?.selectAll("rect").attr("opacity", "0.5");
      selected = d3.select(this as SVGRectElement);
      selected?.selectAll("rect").attr("opacity", "1");
    })
    // enter a second time = loop subgroup per subgroup to add all rectangles
    .data((d) => d.dimensions())
    .join("rect")
    .attr("x", (d) => x(d[0]))
    .attr("class", (_d,i) => i.toString())
    .attr("width", (d) => x(d[1]))
    .attr("height", y.bandwidth())
    .attr("fill", (_d, i) => color(i))
    .attr("opacity", "0.5")
    .on("click", function () {
      selected?.selectAll("rect").attr("opacity", "0.5");
      selected = d3.select((this as Element).parentElement!);
      selected?.selectAll("rect").attr("opacity", "1");
    });
    
}

function shortenText(text: string, maxLength: number): string {
  if (text.length > maxLength) {
    return text.slice(0, maxLength - 2) + "...";
  } else {
    return text;
  }
}
