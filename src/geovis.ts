import * as d3 from "d3";
import { FeatureCollection } from "geojson";
import { Row, Vulnerability, Location, Margin } from "./types";

type Resolution = "province" | "township";
type Scaling = "nil" | "capita" | "fraction";

interface LocationVulnerabilities {
  severity_none: number;
  severity_low: number;
  severity_medium: number;
  severity_high: number;
  severity_critial: number;
  total_vulns: number;
  population: number;
  total_devices: number;
}

type LocVulnCounts = { [key: string]: LocationVulnerabilities };

export function drawGeo(
  locations: d3.DSVParsedArray<Location>,
  shodan: d3.DSVParsedArray<Row>,
  vulnerabilities: d3.DSVParsedArray<Vulnerability>,
  geo_json: FeatureCollection,
  resolution: Resolution,
  scaling: Scaling
) {
  const loc_vuln_counts = agg_vuln_per_resolution(
    shodan,
    vulnerabilities,
    locations,
    resolution
  );

  const svg = d3.select("svg#right-plot");
  const [width, height] = Margin.all(50).dimensions("svg#right-plot");

  const projection = d3
    .geoMercator()
    .center([5.2913, 52.1326]) // longitude and latitude
    .scale(5000)
    .translate([width / 2, height / 2]);

  const transform_data = transform_data_generator(resolution, scaling);

  svg
    .append("g")
    .selectAll("path")
    .data(geo_json.features)
    .enter()
    .append("path")
    .attr("id", (d) => d.properties!.name)
    .attr("fill", (d) => transform_data(loc_vuln_counts, d.properties!.name))
    .attr("d", d3.geoPath().projection(projection))
    .style("stroke", "black");
}

// this function returns a function that will ultimately set the fill for a given configuration of resolution and scaling
// its IMPORTANT to tweak with the colorscale domain values cause I'm not sure if there is a heuristic to do that.
function transform_data_generator(
  resolution: Resolution,
  scaling: Scaling
): (lvc: LocVulnCounts, rn: string) => string {
  const domains: { [key: string]: number[] } = {
    nil: [0, 6000, 20000, 50000],
    capita: [0, 0.005, 0.01, 0.1],
    fraction: [0, 0.03, 0.1, 0.2],
  };
  const colorScale = d3
    .scaleThreshold<number, string, never>()
    .domain(domains[scaling])
    .range(d3.schemeReds[5]);

  const stats: { [key: string]: (l: LocationVulnerabilities) => number } = {
    nil: (x) => x.total_vulns,
    capita: (x) => x.total_vulns / x.population,
    fraction: (x) => x.total_vulns / x.total_devices,
  };

  const stat = stats[scaling];

  if (resolution === "province") {
    return (lvc, rn) => colorScale(stat(lvc[rn]));
  } else if (resolution === "township") {
    return (lvc, rn) =>
      rn in lvc // necessary to perform this check cause some townships have no vuln devices
        ? colorScale(stat(lvc[rn]))
        : colorScale(0);
  }

  throw "Something is very wrong if it came to this";
}

function agg_vuln_per_resolution(
  shodan: d3.DSVParsedArray<Row>,
  vulnerabilities: d3.DSVParsedArray<Vulnerability>,
  locations: d3.DSVParsedArray<Location>,
  resolution: Resolution
) {
  const loc_vuln_counts: LocVulnCounts = {};
  const seen_loc_idx: number[] = []; // list to hold indexes of locations we've already seen

  for (let i = 0; i < shodan.length; i++) {
    if (shodan[i].location >= locations.length) {
      continue;
    } //skip if idx of location is for some reason larger than locations.length

    var resolution_name = get_device_resolution(
      shodan[i].location,
      locations,
      resolution
    ); //get province or township of the location idx
    var device_cvss = get_avg_cvss_score(shodan[i].vulns, vulnerabilities)!; //get average cvss score for device if device has more than one vuln

    if (!(resolution_name in loc_vuln_counts)) {
      //if we encounter province or township for the first time then init a place in the dict
      loc_vuln_counts[resolution_name] = {
        severity_none: 0,
        severity_low: 0,
        severity_medium: 0,
        severity_high: 0,
        severity_critial: 0,
        total_vulns: 0,
        population: 1, //avoid division by 0 like a legend
        total_devices: 1,
      };
    }

    // classify device according cvss 3.0 score standard
    const loc = loc_vuln_counts[resolution_name];
    if (device_cvss < 0.1) {
      loc.severity_none += 1;
    } else if (device_cvss >= 0.1 && device_cvss < 4) {
      loc.severity_low += 1;
    } else if (device_cvss >= 4 && device_cvss < 7) {
      loc.severity_medium += 1;
    } else if (device_cvss >= 7 && device_cvss < 9) {
      loc.severity_high += 1;
    } else if (device_cvss >= 9 && device_cvss <= 10) {
      loc.severity_critial += 1;
    }

    loc.total_vulns += 1;

    if (seen_loc_idx.includes(shodan[i].location)) {
      continue;
    } //skip aggregating if we've seen the location index before

    loc.total_devices += get_city_total_devices(
      shodan[i].location,
      locations
    );
    loc.population += get_city_population(
      shodan[i].location,
      locations
    );
    seen_loc_idx.push(shodan[i].location);
  }

  return loc_vuln_counts;
}

function get_avg_cvss_score(
  vulns: number[],
  vulnerabilities: d3.DSVParsedArray<Vulnerability>
) {
  return d3.mean(vulns, (v) => vulnerabilities[v].cvss);
}

function get_device_resolution(
  loc_idx: number,
  locations: d3.DSVParsedArray<Location>,
  resolution: Resolution
) {
  return locations[loc_idx][resolution];
}

function get_city_population(
  loc_idx: number,
  locations: d3.DSVParsedArray<Location>
) {
  return locations[loc_idx].population;
}

function get_city_total_devices(
  loc_idx: number,
  locations: d3.DSVParsedArray<Location>
) {
  return locations[loc_idx].total_devices;
}
