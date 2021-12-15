import "./style.css";
import * as d3 from "d3";
import { Row, Vulnerability, Organisation, Location } from "./types";
import { drawLeftPlot } from "./left";
import { RightPlot } from "./right";
import { drawGeo } from "./geovis";
import { FeatureCollection } from "geojson";
import { select } from "d3";

const shodan: d3.DSVParsedArray<Row> = await d3.csv(
  "data/shodan.csv",
  (d): Row => {
    return new Row(
      d.ip_str!,
      d.isp!,
      d.org!,
      d.os!,
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

const resolution = "township"; // 'province' or 'township';
const scaling = "capita"; // 'nil' or 'capita' or 'fraction';

// load the appropriate geojson file
const geo_json: FeatureCollection = (await d3.json(
  "data/nl_" + resolution + "s.geojson"
))!;

let selectedOrganisation: string | null = null;

function setSelection(org: string | null) {
  if (selectedOrganisation != org) {
    selectedOrganisation = org;
    right.setFilter(selectedOrganisation);
  }
}

function redraw(element:string){
}

const category = document.getElementById('category');
category!.onchange=function() {
    drawLeftPlot(shodan, vulnerabilities, setSelection, this.value);
}

// drawGeo(locations, shodan, vulnerabilities, geo_json, 'province')
drawLeftPlot(shodan, vulnerabilities, setSelection, 'isp');
let right = new RightPlot(document.querySelector("svg#right-plot")!, shodan, vulnerabilities);
drawGeo(locations, shodan, vulnerabilities, geo_json, resolution, scaling);
