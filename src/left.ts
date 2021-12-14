import * as d3 from "d3";
import {Margin, Organisation, Vulnerability} from "./types";
import {Series} from "d3";

export function drawLeftPlot(organisations: d3.DSVParsedArray<Organisation>) {
// set the dimensions and margins of the graph
   const svg = d3.select("svg#left-plot");
   let [width, height] = Margin.all(50).dimensions("svg#left-plot");
   const subgroups = organisations.columns.slice(1)

   const groups = organisations.map(d => (d.name))

   const x = d3.scaleLinear()
       .domain([0, 8000])
       .range([0, width]);
      svg.append("g")
          .attr("transform", `translate(0, ${height})`)
          .call(d3.axisBottom(x))
          .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end");

      // Add Y axis
      const y = d3.scaleBand()
          .domain(groups)
          .range([ 10, height ])
          .padding(0.1);
   svg.append("g")
       .attr("transform", `translate(0, ${width}+${width})`)
       .call(d3.axisLeft(y).tickSizeOuter(0))
       .selectAll("text")
       .style("text-anchor", "end");

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
          .attr("x", d=> x(d[0]))
          .attr("y", d=> y(d.data.name))//y(d.name))
          .attr("width", d => x(d[1]) - x(d[0]))
          .attr("height",y.bandwidth())


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
