import * as d3 from "d3";
import { ScaleOrdinal } from "d3";
import {
  Dimensions,
  Margin,
  LeftPlotObject,
  Row,
  Location,
  Vulnerability,
  Choice,
} from "./types";

let selected: Element | null = null;
let locs: d3.DSVParsedArray<Location> | null = null;
let cache: { [key: string]: { [key: string]: LeftPlotObject }} = {}

export function drawLeftPlot(
  shodan: d3.DSVParsedArray<Row>,
  vulnerabilities: d3.DSVParsedArray<Vulnerability>,
  locations: d3.DSVParsedArray<Location>,
  onSelect: (org: string | null) => void,
  choice: Choice
) {
  locs = locations;
  // set the dimensions and margins of the graph
  d3.select("svg#left-plot").selectAll("*").remove();
  const svg = d3
    .select("svg#left-plot")
    .append("g")
    .attr("transform", `translate(160, 0)`);
  const dim = new Dimensions(
    document.querySelector("svg#left-plot")!,
    new Margin(0, 20, 50, 140)
  );

  let data = Object.values(getData(shodan, vulnerabilities, choice));
  data.sort((a, b) => b.total() - a.total());
  data = data.slice(0, 20);

  const groups = data.map((d) => d.name);

  const x = d3.scaleLinear().domain([0, data[0].total()]).range([0, dim.width]);
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
    .call(
      d3
        .axisLeft(y)
        .tickSizeOuter(0)
        .tickFormat((x) =>
          choice == "os" ? shortenOSText(x, 25) : shortenText(x, 25)
        )
    )
    .selectAll("text")
    .style("text-anchor", "end");

  // color palette = one color per subgroup
  const color = d3.scaleOrdinal(
    [...new Array(10).keys()].reverse(),
    d3.schemeSpectral[10]
  );

  // Show the bars
  svg
    .append("g")
    .attr("transform", `translate(1, 0)`)
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(data)
    .join("g")
    .attr("id", (d) => d.val)
    .attr("transform", (d) => `translate(0, ${y(d.name)})`)
    .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    .data((d) => d.dimensions())
    .join("rect")
    .attr("x", (d) => x(d[0]))
    .attr("class", (_d, i) => i.toString())
    .attr("width", (d) => x(d[1]))
    .attr("height", y.bandwidth())
    .attr("fill", (_d, i) => color(i))
    .attr("opacity", "1")
    .on("click", function () {
      const parent = (this as Element).parentElement!;
      if (selected == parent) {
        d3.select(parent.parentElement)
          .selectAll("g")
          .selectAll("rect")
          .transition()
          .duration(300)
          .attr("opacity", "1");
        selected = null;
        onSelect(null);
      } else {
        selected = parent;
        d3.select(parent.parentElement)
          .selectAll("g")
          .selectAll("rect")
          .transition()
          .duration(300)
          .attr("opacity", "0.4");
        d3.select(parent)
          .selectAll("rect")
          .transition()
          .duration(300)
          .attr("opacity", "1");
        onSelect(d3.select(selected).attr("id"));
      }
    });
}

function shortenText(text: string, maxLength: number): string {
  if (text.length > maxLength) {
    return text.slice(0, maxLength - 2) + "...";
  } else {
    return text;
  }
}

function shortenOSText(text: string, maxLength: number): string {
  if (text.length > maxLength) {
    const s = text.split(" ");
    const version = s[s.length - 1];
    return text.slice(0, maxLength - version.length - 2) + "..." + version;
  } else {
    return text;
  }
}

function getData(
  shodan: d3.DSVParsedArray<Row>,
  vulnerabilities: d3.DSVParsedArray<Vulnerability>,
  choice: Choice
): { [key: string]: LeftPlotObject } {
  if (choice in cache) {
    return cache[choice];
  }

  const data: { [key: string]: LeftPlotObject } = {};
  for (const row of shodan) {
    if (row[choice] == "") continue;

    const key = getChoice(row, choice);
    if (key == null) continue;

    if (!(key in data)) {
      data[key] = new LeftPlotObject(
        row[choice].toString(),
        key.toString(),
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      );
    }
    for (const v in row.vulns) {
      data[key].vulns[Math.floor(vulnerabilities[v].cvss - 1)] += 1;
    }
  }

  cache[choice] = data;

  return data;
}

function getChoice(row: Row, choice: Choice): string | null {
  switch (choice) {
    case "location":
      try {
        return locs![row.location].city;
      } catch (e) {
        return null;
      }
    default:
      return row[choice];
  }
}
