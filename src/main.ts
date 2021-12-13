import "./style.css";
import * as d3 from "d3";
import { Row, Vulnerability, Location } from "./types";
import { drawLeftPlot } from "./left";
import { drawRightPlot } from "./right";
import { drawGeo } from "./geovis";

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

const geo_json = await d3.json('data/nl_provinces.geojson');

// console.log(geo_json.features)

// var test = [4,5,7,7,3].map((v) => vulnerabilities[v].cvss)

// console.log(test)
(window as any).locations = locations;
(window as any).shodan = shodan;

drawGeo(locations, shodan, vulnerabilities, geo_json, 'province', 'capita')


// drawRightPlot(vulnerabilities);