import * as d3 from "d3";
import { Vulnerability, Margin, Plot, Row, Choice } from "./types";

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

  constructor(
    container: HTMLElement,
    shodan: d3.DSVParsedArray<Row>,
    vulnerabilities: d3.DSVParsedArray<Vulnerability>
  ) {
    super(container, Margin.all(50));

    this.shodan = shodan;
    this.vulnerabilities = vulnerabilities;
    this.cachedFilters = {};

    this.group = d3
      .select(this.container)
      .append("g")
      .attr("transform", "translate(90, 25)");

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
      .attr("r", 4);

    this.update();

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
