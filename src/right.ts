import * as d3 from "d3";
import { Vulnerability, Margin, Plot } from "./types";

export class RightPlot extends Plot {
  vulnerabilities: d3.DSVParsedArray<Vulnerability>;
  x: d3.ScaleLinear<number, number, never>;
  y: d3.ScaleLinear<number, number, never>;
  xAxis: d3.Selection<SVGGElement, unknown, null, undefined>;
  group: d3.Selection<SVGGElement, unknown, null, undefined>

  constructor(container: HTMLElement, vulnerabilities: d3.DSVParsedArray<Vulnerability>) {
    super(container, Margin.all(50));
    
    this.vulnerabilities = vulnerabilities;

    this.group = d3.select(this.container).append("g").attr("transform", "translate(90, 25)");

    this.x = d3.scaleLinear().domain([0, 10]).range([0, this.width]);
    this.y = d3
      .scaleLinear()
      .domain([0, d3.max(vulnerabilities, (v) => v.count)!])
      .range([this.height, 0]);

    this.xAxis = this.group
      .append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(this.x));

    this.group.append("text")
      .attr("id", "xLabel")
      .attr("class", "label")
      .attr("text-anchor", "end")
      .attr("x", this.width)
      .attr("y", this.height + 50)
      .text("Severity (CVSS score)");

    this.group.append("g").call(d3.axisLeft(this.y).ticks(10));
    this.group.append("text")
      .attr("class", "label")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", 0)
      .text("Number of affected devices");

    this.group.selectAll("dot")
      .data(vulnerabilities)
      .enter()
      .append("circle")
      .attr("r", 4)
      .attr("cx", (v) => this.x(v.cvss))
      .attr("cy", (v) => this.y(v.count))
      .style("fill", "#EA5F21ff");
    
      window.addEventListener("resize", () => { this.update() });
  }

  update(): void {
    this.dimensions.refresh();
    this.x = this.x.range([0, this.width]);
    this.xAxis.call(d3.axisBottom(this.x));

    this.group.selectAll("circle")
      .data(this.vulnerabilities)
      .attr("cx", (v) => this.x(v.cvss));

    this.group.select("#xLabel").attr("x", this.width);
  }

  clear() {
    this.group.remove();
  }
}
