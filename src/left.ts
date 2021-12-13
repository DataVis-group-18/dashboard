import * as d3 from "d3";
import {Margin, Organisation, Vulnerability} from "./types";
import {Series} from "d3";

export function drawLeftPlot(organisations: d3.DSVParsedArray<Organisation>) {
// set the dimensions and margins of the graph
   const svg = d3.select("svg#left-plot");
   const [width, height] = Margin.all(50).dimensions("svg#right-plot");

   const g = svg.append("g").attr("transform", "translate(90, 25)");

   const subgroups = organisations.columns.slice(1)

   const groups = organisations.map(d => (d.name))

   const x = d3.scaleBand()
          .domain(groups)
          .range([0, width])
          .padding(0.2)
      svg.append("g")
          .attr("transform", `translate(0, ${height})`)
          .call(d3.axisBottom(x).tickSizeOuter(0));

      // Add Y axis
      const y = d3.scaleLinear()
          .domain([0, 8000])
          .range([ height, 0 ]);
      svg.append("g")
          .call(d3.axisLeft(y));

      // color palette = one color per subgroup
      const color = d3.scaleOrdinal()
          .domain(subgroups)
          .range(['#00FF00','#33ff00','#66ff00','#99ff00','#ccff00','#FFFF00','#FFCC00','#ff9900','#FF3300','#FF0000'])

      //stack the data? --> stack per subgroup
      const stackedData = d3.stack()
          .keys(subgroups)
          (organisations)

      // Show the bars
      svg.append("g")
          .selectAll("g")
          // Enter in the stack data = loop key per key = group per group
          .data(stackedData)
          .join("g")
          .attr("fill", d => color(d.key))
          .selectAll("rect")
          // enter a second time = loop subgroup per subgroup to add all rectangles
          .data(d => d)
          .join("rect")
          .attr("x", d => x(d.data.name))
          .attr("y", d => y(d[1]))
          .attr("height", d => y(d[0]) - y(d[1]))
          .attr("width",x.bandwidth())
   }

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
