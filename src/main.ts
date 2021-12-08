import "./style.css";
import * as d3 from "d3";

const svg = d3.select("svg");
const margin = 100;

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

class Vulnerability {
  cve: string;
  count: number;
  verified: boolean;
  cvss: number;

  constructor(cve: string, count: number, verified: boolean, cvss: number) {
    this.cve = cve;
    this.count = count;
    this.verified = verified;
    this.cvss = cvss;
  }
}

const shodan: d3.DSVParsedArray<Row> = await d3.csv(
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

const vulnerabilities: d3.DSVParsedArray<Vulnerability> = await d3.csv(
  "data/vulnerabilities.csv",
  (r): Vulnerability => {
    return new Vulnerability(
      r.cve!,
      parseInt(r.count!),
      r.verified! == "true",
      parseFloat(r.cvss!)
    );
  }
);

function draw(transition = false) {
  d3.select('g').remove();
  const boundingRect = document
    .getElementById("left-plot")!
    .getBoundingClientRect();
  const width = boundingRect.width - margin;
  const height = boundingRect.height - margin;
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

  if (transition) {
    dots
      .style("fill", "#EA5F2100")
      .attr("cy", (v) => height)
      .transition()
      .delay((v, i) => 3 * i + Math.random() * 700)
      .duration(500 + Math.random() * 2000)
      .attr("cy", (v) => y(v.count))
      .style("fill", "#EA5F21ff");
  }
}

window.addEventListener("resize", () => draw());

draw(true);

// let counts = new Map<number, number>();
// for (const row of data) {
//   if (!row.vulns) {
//     continue;
//   }
//   let vulns = Object.keys(row.vulns).length;
//   let count = counts.get(vulns) || 0;
//   counts.set(vulns, count + 1);
// }

// const min = Math.min(...counts.values());
// const max = Math.max(...counts.values());
// x.domain([Math.min(...counts.keys()), Math.max(...counts.keys())]);
// y.domain([Math.min(...counts.values()), Math.max(...counts.values())]);

// console.log(counts);

// g.append("g")
//   .attr("transform", "translate(0," + height + ")")
//   .call(d3.axisBottom(x))
//   .append("text")
//   .attr("y", 50)
//   .attr("x", width)
//   .attr("text-anchor", "end")
//   .attr("stroke", "black")
//   .text("x label");

// g.append("g")
//   .call(d3.axisLeft(y).ticks(10))
//   .append("text")
//   .attr("transform", "rotate(-90)")
//   .attr("y", 6)
//   .attr("dy", "-5.1em")
//   .attr("text-anchor", "end")
//   .attr("stroke", "black")
//   .text("y label");

// g.selectAll(".bar")
//   .data(counts.entries())
//   .enter()
//   .append("rect")
//   .on("mouseover", function () {
//     d3.select(this).transition().delay(0.5).style("fill", "orange");
//   })
//   .on("mouseout", function () {
//     d3.select(this).transition().delay(0.5).style("fill", "black");
//   })
//   .attr("class", "bar")
//   .attr("x", (v) => x(v[0]))
//   .attr("y", (v) => y(v[1]))
//   .attr("width", width / x.range()[1])
//   .transition()
//   .ease(d3.easeLinear)
//   .duration(400)
//   .delay((d, i) => i * 50)
//   .attr("height", (v) => height - y(v[1]));
