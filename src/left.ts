import * as d3 from "d3";
import {
  Margin,
  LeftPlotObject,
  Row,
  Location,
  Vulnerability,
  Choice,
  Plot,
  Data,
} from "./types";

let selected: Element | null = null;
let locs: d3.DSVParsedArray<Location> | null = null;
let cache: { [key: string]: { [key: string]: LeftPlotObject } } = {};

export class LeftPlot extends Plot {
  data: Data;
  svg: d3.Selection<SVGGElement, unknown, null, undefined>;
  x: d3.ScaleLinear<number, number, never>;
  groups: string[];
  choice: Choice;
  objects: LeftPlotObject[];
  scaleElem: HTMLInputElement;
  xAxis: d3.Selection<SVGGElement, unknown, null, undefined>;
  yAxis: d3.Selection<SVGGElement, unknown, null, undefined>;
  bars: d3.Selection<SVGGElement, unknown, null, undefined>;
  minCVSS: number;
  onSelect: (org: string | null) => void;

  constructor(
    data: Data,
    onSelect: (org: string | null) => void,
    choice: Choice
  ) {
    super(document.querySelector("svg#left-plot")!, new Margin(0, 20, 50, 140));
    locs = data.locations;
    this.data = data;
    this.choice = choice;
    this.onSelect = onSelect;
    this.scaleElem = document.querySelector("#scale")! as HTMLInputElement;
    this.objects = [];
    this.groups = [];
    this.minCVSS = 1;
    this.x = d3.scaleLinear();

    this.svg = d3
      .select(this.container)
      .on("click", function () {
        selected = null;
        d3.select(this)
          .selectAll("rect.bar")
          .transition()
          .duration(300)
          .attr("opacity", "1");
        onSelect(null);
      })
      .append("g")
      .attr("transform", `translate(160, 0)`);

    // This is a transparent rect in the background that receives unpropagated events
    // this makes it possible to detect mouse evetns outside the bars.
    this.svg
      .append("rect")
      .attr("x", "0")
      .attr("y", "0")
      .attr("width", this.dimensions.width.toString())
      .attr("height", this.dimensions.height.toString())
      .attr("opacity", "0");

    this.xAxis = this.svg
      .append("g")
      .attr("transform", `translate(0, ${this.height})`);

    this.yAxis = this.svg.append("g");

    this.bars = this.svg.append("g").attr("transform", `translate(1, 0)`);

    this.updateChoice(choice);

    let drag = false;
    let initialPos = 0;
    let down = false;

    this.scaleElem.addEventListener("mousedown", (ev: Event) => {
      const e = ev as MouseEvent;
      drag = false;
      down = true;
      initialPos = e.pageX;
    });

    this.scaleElem.addEventListener("mousemove", (ev: Event) => {
      const e = ev as MouseEvent;
      if (down && (drag || Math.abs(e.pageX - initialPos) > 10)) {
        drag = true;
        this.update(false);
      }
    });

    this.scaleElem.addEventListener("mouseup", () => {
      if (!drag) this.update(true);
      down = false;
    });

    document.querySelector("#min-cvss")?.addEventListener("change", (ev) => {
      this.updateChoice(this.choice);
    });
  }

  updateChoice(c: Choice) {
    this.choice = c;
    this.objects = Object.values(
      getData(this.data.shodan, this.data.vulnerabilities, this.choice)
    );

    this.minCVSS = parseInt(
      (document.querySelector("#min-cvss")! as HTMLInputElement).value
    );
    this.objects.sort((a, b) => b.total(this.minCVSS) - a.total(this.minCVSS));
    this.objects = this.objects.slice(0, 20);
    console.log(this.objects[0]);

    this.groups = this.objects.map((d) => d.name);

    this.x = this.x
      .domain([0, this.objects[0].total(this.minCVSS)])
      .range([0, this.width]);

    this.scaleElem.max = this.objects[0].total(this.minCVSS).toString();
    this.scaleElem.min = this.objects[this.objects.length - 1]
      .total(this.minCVSS)
      .toString();
    this.scaleElem.value = this.scaleElem.max;

    // Add Y axis
    const y = d3
      .scaleBand()
      .domain(this.groups)
      .range([10, this.height])
      .padding(0.1);

    this.yAxis
      .call(
        d3
          .axisLeft(y)
          .tickSizeOuter(0)
          .tickFormat((x) =>
            this.choice == "os" ? shortenOSText(x, 25) : shortenText(x, 25)
          )
      )
      .selectAll("text")
      .style("text-anchor", "end");

    // color palette = one color per subgroup
    const color = (v: number) => d3.interpolateTurbo((v+1) / 10);

    const onSelect = this.onSelect;

    // Show the bars
    this.bars
      .selectAll("g")
      .data(this.objects)
      .join("g")
      .attr("id", (d) => d.val)
      .attr("transform", (d) => `translate(0, ${y(d.name)})`)
      .selectAll("rect")
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data((d) => d.dimensions(this.minCVSS))
      .join("rect")
      // .attr("class", "bar")
      .attr("class", (_d, i) => i.toString() + " bar")
      .attr("height", y.bandwidth())
      .attr("fill", (_d, i) => color(i))
      .attr("opacity", "1")
      .on("click", function (ev: Event) {
        ev.stopPropagation();
        const parent = (this as Element).parentElement!;
        if (selected == parent) {
          d3.select(parent.parentElement)
            .selectAll("rect.bar")
            .transition()
            .duration(300)
            .attr("opacity", "1");
          selected = null;
          onSelect(null);
        } else {
          selected = parent;
          d3.select(parent.parentElement)
            .selectAll("rect.bar")
            .transition()
            .duration(300)
            .attr("opacity", "0.4");
          d3.select(parent)
            .selectAll("rect.bar")
            .transition()
            .duration(300)
            .attr("opacity", "1");
          onSelect(d3.select(selected).attr("id"));
        }
      });

    this.update(true);
  }

  update(transition = false) {
    this.x = this.x.domain([0, parseInt(this.scaleElem.value)]);

    this.xAxis
      .call(d3.axisBottom(this.x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    this.bars
      .selectAll("g")
      .data(this.objects)
      .selectAll("rect")
      .data((d) => d.dimensions(this.minCVSS))
      .transition()
      .duration(transition ? 300 : 0)
      .attr("x", (d) => this.x(d[0]))
      .attr("width", (d) => this.x(d[1]));

    this.svg.selectAll(".bar").selectAll("*").remove();
  }

  clear() {
    this.svg.selectAll("*").remove();
  }
}

function shortenText(text: string, maxLength: number): string {
  if (text.length > maxLength) {
    return text.slice(0, maxLength - 2) + "...";
  } else {
    return text;
  }
}

function shortenOSText(text: string, maxLength: number): string {
  if (text.length > maxLength) {
    const s = text.split(" ");
    const version = s[s.length - 1];
    return text.slice(0, maxLength - version.length - 2) + "..." + version;
  } else {
    return text;
  }
}

function getData(
  shodan: d3.DSVParsedArray<Row>,
  vulnerabilities: d3.DSVParsedArray<Vulnerability>,
  choice: Choice
): { [key: string]: LeftPlotObject } {
  if (choice in cache) {
    return cache[choice];
  }

  const data: { [key: string]: LeftPlotObject } = {};
  for (const row of shodan) {
    if (row[choice] == "") continue;

    const key = getChoice(row, choice);
    if (key == null) continue;

    if (!(key in data)) {
      data[key] = new LeftPlotObject(
        row[choice].toString(),
        key.toString(),
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      );
    }
    for (const v of row.vulns) {
      data[key].vulns[Math.floor(vulnerabilities[v].cvss - 1)] += 1;
    }
  }
  cache[choice] = data;

  return data;
}

function getChoice(row: Row, choice: Choice): string | null {
  switch (choice) {
    case "location":
      try {
        return locs![row.location].city;
      } catch (e) {
        return null;
      }
    default:
      return row[choice];
  }
}
