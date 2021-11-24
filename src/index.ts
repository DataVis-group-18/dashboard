import * as d3 from "d3";

const svg = d3.select("svg");
const margin = 200;
const width = parseInt(svg.attr("width")) - margin;
const height = parseInt(svg.attr("height")) - margin;

const x = d3.scaleBand().range([0, width]).padding(0.4);
const y = d3.scaleLinear().range([height, 0]);

const g = svg.append("g").attr("transform", "translate(100, 50)");

d3.csv("test.csv").then((data) => {
  x.domain(data.map((d) => d.year!));

  y.domain([0, d3.max(data, (d) => d.value)] as number[]);

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
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.year!)!)
    .attr("y", (d) => y(parseInt(d.value!)))
    .attr("width", x.bandwidth())
    .transition()
    .ease(d3.easeLinear)
    .duration(400)
    .delay((d, i) => i * 50)
    .attr("height", (d) => height - y(parseInt(d.value!)));
});
