import "./style.css";
import * as d3 from "d3";

const svg = d3.select("svg");
const margin = 200;
const width = parseInt(svg.attr("width")) - margin;
const height = parseInt(svg.attr("height")) - margin;

const x = d3.scaleLinear().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

const g = svg.append("g").attr("transform", "translate(100, 50)");

class Row {
  ip_str: string;
  isp: string;
  org: string;
  os: string;
  port: number;
  timestamp: Date;
  location: number;
  vulns: number[];

  constructor(
    ip_str: string,
    isp: string,
    org: string,
    os: string,
    port: number,
    timestamp: Date,
    location: number,
    vulns: number[]
  ) {
    this.ip_str = ip_str;
    this.isp = isp;
    this.org = org;
    this.os = os;
    this.port = port;
    this.timestamp = timestamp;
    this.location = location;
    this.vulns = vulns;
  }
}

const data: d3.DSVParsedArray<Row> = await d3.csv(
  "data/shodan.csv",
  (d): Row => {
    return new Row(
      d.ip_str!,
      d.isp!,
      d.org!,
      d.os!,
      +d.port!,
      new Date(d.timestamp!),
      +d.location!,
      JSON.parse(d.vulns!) as number[]
    );
  }
);

console.log(data);

let counts = new Map<number, number>();
for (const row of data) {
  if (!row.vulns) {
    continue;
  }
  let vulns = Object.keys(row.vulns).length;
  let count = counts.get(vulns) || 0;
  counts.set(vulns, count + 1);
}

const min = Math.min(...counts.values());
const max = Math.max(...counts.values());
x.domain([Math.min(...counts.keys()), Math.max(...counts.keys())]);
y.domain([Math.min(...counts.values()), Math.max(...counts.values())]);

console.log(counts);

g.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x))
  .append("text")
  .attr("y", 50)
  .attr("x", width)
  .attr("text-anchor", "end")
  .attr("stroke", "black")
  .text("x label");

g.append("g")
  .call(d3.axisLeft(y).ticks(10))
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", "-5.1em")
  .attr("text-anchor", "end")
  .attr("stroke", "black")
  .text("y label");

g.selectAll(".bar")
  .data(counts.entries())
  .enter()
  .append("rect")
  .on("mouseover", function () {
    d3.select(this).transition().delay(0.5).style("fill", "orange");
  })
  .on("mouseout", function () {
    d3.select(this).transition().delay(0.5).style("fill", "black");
  })
  .attr("class", "bar")
  .attr("x", (v) => x(v[0]))
  .attr("y", (v) => y(v[1]))
  .attr("width", width / x.range()[1])
  .transition()
  .ease(d3.easeLinear)
  .duration(400)
  .delay((d, i) => i * 50)
  .attr("height", (v) => height - y(v[1]));
