import * as d3 from "d3";
import { Vulnerability, Margin } from "./types";

export function drawRightPlot(
  vulnerabilities: d3.DSVParsedArray<Vulnerability>,
) {
  const svg = d3.select("svg#right-plot");
  const [width, height] = Margin.all(50).dimensions("svg#right-plot");
  
  const g = svg.append("g").attr("transform", "translate(90, 25)");
  const x = d3.scaleLinear().domain([0, 10]).range([0, width]);
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(vulnerabilities, (v) => v.count)!])
    .range([height, 0]);

  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  g.append("text")
    .attr("class", "label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + 50)
    .text("Severity (CVSS score)");

  g.append("g").call(d3.axisLeft(y).ticks(10));
  g.append("text")
    .attr("class", "label")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -50)
    .attr("x", 0)
    .text("Number of affected devices");

  const dots = g
    .append("g")
    .selectAll("dot")
    .data(vulnerabilities)
    .enter()
    .append("circle")
    .attr("r", 3)
    .attr("cx", (v) => x(v.cvss))
    .attr("cy", (v) => y(v.count))
    .style("fill", "#EA5F21ff");

  window.addEventListener("resize", () => {});
}
