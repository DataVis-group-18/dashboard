import * as d3 from "d3";
import { Vulnerability, Dimensions, Margin } from "./types";

const svg = d3.select("svg#right-plot");
const margin = Margin.all(50);
let dim = Dimensions.of("svg#right-plot").withMargin(margin);
const g = svg.append("g").attr("transform", "translate(90, 25)");

export function drawRightPlot(
  vulnerabilities: d3.DSVParsedArray<Vulnerability>
) {
  let x = d3.scaleLinear().domain([0, 10]).range([0, dim.width]);
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(vulnerabilities, (v) => v.count)!])
    .range([dim.height, 0]);

  let xAxis = g
    .append("g")
    .attr("transform", "translate(0," + dim.height + ")")
    .call(d3.axisBottom(x));

  g.append("text")
    .attr("id", "xLabel")
    .attr("class", "label")
    .attr("text-anchor", "end")
    .attr("x", dim.width)
    .attr("y", dim.height + 50)
    .text("Severity (CVSS score)");

  g.append("g").call(d3.axisLeft(y).ticks(10));
  g.append("text")
    .attr("class", "label")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -50)
    .attr("x", 0)
    .text("Number of affected devices");

  g.selectAll("dot")
    .data(vulnerabilities)
    .enter()
    .append("circle")
    .attr("r", 4)
    .attr("cx", (v) => x(v.cvss))
    .attr("cy", (v) => y(v.count))
    .style("fill", "#EA5F21ff");

  function updatePlot() {
    dim = Dimensions.of("svg#right-plot").withMargin(margin);
    x = x.range([0, dim.width]);
    xAxis.call(d3.axisBottom(x));

    g.selectAll("circle")
      .data(vulnerabilities)
      .attr("cx", (v) => x(v.cvss));

    g.select("#xLabel").attr("x", dim.width);
  }

  window.addEventListener("resize", updatePlot);
}
