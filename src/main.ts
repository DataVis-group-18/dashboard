import "./style.css";
import * as d3 from "d3";
import { Row, Vulnerability, Organisation } from "./types";
import { drawLeftPlot } from "./left";
import { drawRightPlot } from "./right";

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

const organisations: d3.DSVParsedArray<Organisation> = await d3.csv(
    "data/vulnerabilities_by_orgs_and_severity.csv",
    (o): Organisation => {
        return new Organisation(
            o.name!,
            parseInt(o.sev1!),
            parseInt(o.sev2!),
            parseInt(o.sev3!),
            parseInt(o.sev4!),
            parseInt(o.sev5!),
            parseInt(o.sev6!),
            parseInt(o.sev7!),
            parseInt(o.sev8!),
            parseInt(o.sev9!),
            parseInt(o.sev10!)
        );
    }
);
console.log(organisations)
drawLeftPlot(organisations);
drawRightPlot(vulnerabilities);