import * as d3 from "d3";
import { Row, Vulnerability, Location, Margin } from "./types";


export function drawGeo(
    locations: d3.DSVParsedArray<Location>,
    shodan: d3.DSVParsedArray<Row>,
    vulnerabilities: d3.DSVParsedArray<Vulnerability>,
    geo_json: object,
    resolution : string,
    scaling : string
) {
    var loc_vuln_counts = agg_vuln_per_resolution(shodan, vulnerabilities, locations, resolution)
    // console.log(loc_vuln_counts)


    const svg = d3.select("svg#right-plot");
    const [width, height] = Margin.all(50).dimensions("svg#right-plot");
    
    const projection = d3.geoMercator()
                        .center([5.2913, 52.1326]) // longitude and latitude
                        .scale(4000)
                        .translate([width / 1.5, height / 1.5]);


    var colorScale = d3.scaleThreshold()
    .domain([5000, 10000, 25000, 50000])
    .range(d3.schemeReds[5]);


    svg.append('g')
        .selectAll('path')
        .data(geo_json.features)
        .enter().append('path')
                .attr('id', (d) => d.properties.name)
                .attr('fill', (d) => {
                    var resolution_name = d.properties.name;
                    var agg = loc_vuln_counts[resolution_name]['total_vulns'];
                    return colorScale(agg);
                })
                .attr('d', d3.geoPath()
                    .projection(projection))
                .style('stroke', 'none');

}

function agg_vuln_per_resolution (
    shodan: d3.DSVParsedArray<Row>,
    vulnerabilities: d3.DSVParsedArray<Vulnerability>,
    locations: d3.DSVParsedArray<Location>,
    resolution : string,
    scaling : string
) {
    var loc_vuln_counts = {}; 
    var seen_loc_idx = []; // list to hold indexes of locations we've already seen

    for (let i = 0; i<shodan.length; i++) {

        if (shodan[i].location >= locations.length) { continue; } //skip if idx of location is for some reason larger than locations.length

        var resolution_name = get_device_resolution(shodan[i].location, locations, resolution); //get province or township of the location idx
        var device_cvss = get_avg_cvss_score(shodan[i].vulns, vulnerabilities); //get average cvss score for device if device has more than one vuln

        if (!(resolution_name in loc_vuln_counts)) { //if we encounter province or township for the first time then init a place in the dict
            loc_vuln_counts[resolution_name] = {
                'severity_none' : 0,
                'severity_low' : 0,
                'severity_medium' : 0,
                'severity_high' : 0,
                'severity_critial' : 0,
                'total_vulns' : 0,
                'population' : 1, //avoiding division by 0 like a legend
                'total_devices' : 1,
            }
        }

        // classify device according cvss 3.0 score standard
        if (device_cvss < 0.1){
            loc_vuln_counts[resolution_name]['severity_none'] += 1;
        }
        else if (device_cvss >= 0.1 && device_cvss < 4){
            loc_vuln_counts[resolution_name]['severity_low'] += 1;
        }
        else if (device_cvss >= 4 && device_cvss < 7){
            loc_vuln_counts[resolution_name]['severity_medium'] += 1;
        }
        else if (device_cvss >= 7 && device_cvss < 9){
            loc_vuln_counts[resolution_name]['severity_high'] += 1;
        }
        else if (device_cvss >= 9 && device_cvss <= 10){
            loc_vuln_counts[resolution_name]['severity_critial'] += 1;
        }

        loc_vuln_counts[resolution_name]['total_vulns'] += 1;

        if (seen_loc_idx.includes(shodan[i].location)) { continue; } //skip aggregating if we've seen the location index before

        loc_vuln_counts[resolution_name]['total_devices'] += get_city_total_devices(shodan[i].location, locations);
        loc_vuln_counts[resolution_name]['population'] += get_city_population(shodan[i].location, locations);
        seen_loc_idx.push(shodan[i].location);
    }

    return loc_vuln_counts;
}

function get_avg_cvss_score (
    vulns: number[],
    vulnerabilities: d3.DSVParsedArray<Vulnerability>
) {
     return vulns.map((v) => vulnerabilities[v].cvss)
                            .reduce((p,c) => p+c, 0) / vulns.length;
}

function get_device_resolution (
    loc_idx: number,
    locations: d3.DSVParsedArray<Location>,
    resolution: string
) {
    return locations[loc_idx][resolution];
}

// function get_device_city (
//     loc_idx: number,
//     locations: d3.DSVParsedArray<Location>
// ) {
//     return locations[loc_idx].city;
// }

function get_city_population (
    loc_idx: number,
    locations: d3.DSVParsedArray<Location>,
) {
    return locations[loc_idx].population;
}

function get_city_total_devices (
    loc_idx: number,
    locations: d3.DSVParsedArray<Location>
) {
    return locations[loc_idx].total_devices;
}
