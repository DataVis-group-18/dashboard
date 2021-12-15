import "./style.css";
import * as d3 from "d3";
import { Row, Vulnerability, Location, Choice } from "./types";
import { drawLeftPlot } from "./left";
import { RightPlot } from "./right";
import { drawGeo } from "./geovis";
import { FeatureCollection } from "geojson";

function parseOs(os: string): string {
  return os.replace(/[\- ](Service Pack)?[\- ]?[0-9]+$/g, "");
}

const shodan: d3.DSVParsedArray<Row> = await d3.csv(
  "data/shodan.csv",
  (d): Row => {
    return new Row(
      d.ip_str!,
      d.isp!,
      d.org!,
      parseOs(d.os!),
      parseInt(d.port!),
      new Date(d.timestamp!),
      parseInt(d.location!),
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

const locations: d3.DSVParsedArray<Location> = await d3.csv(
  "data/locations.csv",
  (d): Location => {
    return new Location(
      d.city!,
      d.township!,
      d.province!,
      parseFloat(d.longitude!),
      parseFloat(d.latitude!),
      parseInt(d.population!),
      parseInt(d.total_devices!)
    );
  }
);

console.log(locations);

const resolution = "township"; // 'province' or 'township';
const scaling = "capita"; // 'nil' or 'capita' or 'fraction';

// load the appropriate geojson file
const geo_json: FeatureCollection = (await d3.json(
  "data/nl_" + resolution + "s.geojson"
))!;

let selectedVal: string | null = null;

function setSelection(val: string | null) {
  if (selectedVal != val) {
    selectedVal = val;
    right.setFilter(category.value as Choice, selectedVal);
  }
}

function redraw(element: string) {}

const category = document.getElementById("category")! as HTMLOptionElement;
category!.onchange = function () {
  setSelection(null);
  drawLeftPlot(
    shodan,
    vulnerabilities,
    locations,
    setSelection,
    category.value as Choice
  );
};

// drawGeo(locations, shodan, vulnerabilities, geo_json, 'province')
drawLeftPlot(
  shodan,
  vulnerabilities,
  locations,
  setSelection,
  category.value as Choice
);
let right = new RightPlot(
  document.querySelector("svg#right-plot")!,
  shodan,
  vulnerabilities
);
drawGeo(locations, shodan, vulnerabilities, geo_json, resolution, scaling);
