import * as d3 from "d3";
import { Vulnerability, Margin, Plot, Row, Choice } from "./types";
import {style} from "d3";

export class RightPlot extends Plot {
  shodan: d3.DSVParsedArray<Row>;
  vulnerabilities: d3.DSVParsedArray<Vulnerability>;
  x: d3.ScaleLinear<number, number, never>;
  y: d3.ScaleLinear<number, number, never>;
  maxCount: number;
  xAxis: d3.Selection<SVGGElement, unknown, null, undefined>;
  yAxis: d3.Selection<SVGGElement, unknown, null, undefined>;
  group: d3.Selection<SVGGElement, unknown, null, undefined>;
  filter: string | null = null;
  filteredVulns: { [key: number]: number } | null = null;
  cachedFilters: {
    [key: string]: { [key: string]: { [key: number]: number } };
  };
  tooltip: d3.Selection<SVGGElement, unknown, null, undefined>;

  constructor(
    container: HTMLElement,
    shodan: d3.DSVParsedArray<Row>,
    vulnerabilities: d3.DSVParsedArray<Vulnerability>
  ) {
    super(container, new Margin(70, 50, 70, 90));

    this.shodan = shodan;
    this.vulnerabilities = vulnerabilities;
    this.cachedFilters = {};

    this.group = d3
      .select(this.container)
      .append("g")
      .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

    this.x = d3.scaleLinear().domain([1, 10]).range([0, this.width]);

    this.maxCount = d3.max(vulnerabilities, (v) => v.count)!;
    this.y = d3
      .scaleLinear()
      .domain([0, this.maxCount])
      .range([this.height, 0]);

    this.xAxis = this.group
      .append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(this.x));

    this.group
      .append("text")
      .attr("id", "xLabel")
      .attr("class", "label")
      .attr("text-anchor", "end")
      .attr("x", this.width)
      .attr("y", this.height + 50)
      .text("Severity (CVSS score)");

    this.yAxis = this.group.append("g").call(d3.axisLeft(this.y));
    this.group
      .append("text")
      .attr("class", "label")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -70)
      .attr("x", 0)
      .text("Number of affected devices");

    this.group
      .selectAll("dot")
      .data(vulnerabilities)
      .enter()
      .append("circle")
      .attr("r", 4)
      .on("mouseout", () => {
        this.tooltip.style("display", "none");
        d3.select(event.target).style("stroke", null);
      })
      .on("mouseover", (_ev, v) => {
        this.tooltip.style("display", null);
        this.tooltip.attr(
          "transform",
          `translate(${this.x(v.cvss)},${this.y(v.count)})`
        );
        d3.select(event.target).style("stroke", "black");
        const path = this.tooltip
          .selectAll("path")
          .data([,])
          .join("path")
          .attr("fill", "white")
          .attr("stroke", "#ccc");

        const text = this.tooltip
          .selectAll("text")
          .data([,])
          .join("text")
          .call((text) =>
            text
              .selectAll("tspan")
              .data(`${v.cve} ${v.summary}`.split(/\n/))
              .join("tspan")
              .attr("x", 0)
              .attr("y", (_, i) => `${i * 1.1}em`)
              .text((d) => d)
              .style("font-size", "0.8em")
          );

        const {
          x,
          y,
          width: w,
          height: h,
        } = (text.node()! as SVGGraphicsElement).getBBox();
        text.attr("transform", `translate(${-w / 2},${y - 7})`);
        path.attr(
          "d",
          `M ${-w / 2 - 6},-${h + 21}
           H ${w / 2 + 6}
           v ${h + 12}
           H 5
           l -5,5
           l -5,-5
           H ${-w / 2 - 5}
           z`
        );
      })
    this.update();

    this.tooltip = this.group.append("g").style("pointer-events", "none");

    window.addEventListener("resize", () => {
      this.update();
    });
  }

  update(): void {
    this.dimensions.refresh();
    this.x = this.x.range([1, this.width]);
    this.xAxis.call(d3.axisBottom(this.x));

    this.group
      .selectAll("circle")
      .data(this.vulnerabilities)
      .attr("opacity", (v, i) =>
        this.filteredVulns ? (i in this.filteredVulns ? "1" : "0") : "1"
      )
      .attr("cy", (v, i) =>
        this.y(
          this.filteredVulns && i in this.filteredVulns
            ? this.filteredVulns[i]
            : v.count
        )
      )
      .attr("cx", (v) => this.x(v.cvss))
      .style("fill", (v) => d3.interpolateTurbo((v.cvss - 1) / 9));

    this.group.select("#xLabel").attr("x", this.width);
  }

  setFilter(category: Choice, val: string | null) {
    if (val) {
      this.filter = val;

      // Use cache if we already did this calculation once
      if (
        category in this.cachedFilters &&
        val in this.cachedFilters[category]
      ) {
        this.filteredVulns = this.cachedFilters[category][val];
      } else {
        const vulns = this.shodan
          .filter((r) => r[category] == val)
          .map((r) => r.vulns)
          .flat();

        this.filteredVulns = {};
        for (const v of vulns) {
          if (v in this.filteredVulns) {
            this.filteredVulns[v] += 1;
          } else {
            this.filteredVulns[v] = 1;
          }
        }

        if (!(category in this.cachedFilters)) {
          this.cachedFilters[category] = {};
        }
        this.cachedFilters[category][val] = this.filteredVulns;
      }
      this.y = this.y.domain([0, d3.max(Object.values(this.filteredVulns))!]);
    } else {
      this.filter = null;
      this.filteredVulns = null;
      this.y = this.y.domain([0, this.maxCount]);
    }

    this.yAxis.call(d3.axisLeft(this.y));

    this.update();
  }

  clear() {
    this.group.remove();
  }
}
