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

    // aggregate(locations, resolution, scaling)

    var loc_vuln_counts = agg_vuln_per_location(shodan, vulnerabilities, locations, resolution)
    console.log(loc_vuln_counts)


    // const svg = d3.select("svg#right-plot");
    // const [width, height] = Margin.all(50).dimensions("svg#right-plot");
    
    // const projection = d3.geoMercator()
    //                     .center([5.2913, 52.1326])
    //                     .scale(4000)
    //                     .translate([width / 1.5, height / 1.5]);

    // var colorScale = d3.scaleThreshold()
    // .domain([0, 1])
    // .range(d3.schemeBlues[3]);



    

    // var NL = svg.append('g')
    //     .selectAll('path')
    //     .data(geo_json.features)
    //     .enter().append('path')
    //             .attr('id', (d) => {return d.properties.name})
    //             .attr('fill', 'grey')
    //             .attr('d', d3.geoPath()
    //                 .projection(projection))
    //             .style('stroke', 'none');

    // NL.selectAll('path')
    //   .each( (d, i) => {
    //     d3.select(this)
    //     .attr('fill', () => {
    //         return colorScale(Math.random())
    //     })
    //   })
    

}

function agg_vuln_per_location (
    shodan: d3.DSVParsedArray<Row>,
    vulnerabilities: d3.DSVParsedArray<Vulnerability>,
    locations: d3.DSVParsedArray<Location>,
    resolution : string
) {
    var loc_vuln_counts = {};

    for (let i = 0; i<shodan.length; i++) {

        if (shodan[i].location >= locations.length) { continue; }

        var loc_name = get_device_location(shodan[i].location, locations, resolution)
        var device_cvss = get_avg_cvss_score(shodan[i].vulns, vulnerabilities)

        if (!(loc_name in loc_vuln_counts)) {
            loc_vuln_counts[loc_name] = {
                'low' : 0,
                'medium' : 0,
                'high' : 0,
                'critial' : 0,
                'total' : 0
            }
        }

        if (device_cvss >= 0.1 && device_cvss <= 3.9){
            loc_vuln_counts[loc_name]['low'] += 1;
        }
        else if (device_cvss >= 4 && device_cvss <= 6.9){
            loc_vuln_counts[loc_name]['medium'] += 1;
        }
        else if (device_cvss >= 7 && device_cvss <= 8.9){
            loc_vuln_counts[loc_name]['high'] += 1;
        }
        else if (device_cvss >= 9 && device_cvss <= 10){
            loc_vuln_counts[loc_name]['critial'] += 1;
        }

        loc_vuln_counts[loc_name]['total'] += 1;

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

function get_device_location (
    loc_idx: number,
    locations: d3.DSVParsedArray<Location>,
    resolution: string
) {
    return locations[loc_idx][resolution]
}
