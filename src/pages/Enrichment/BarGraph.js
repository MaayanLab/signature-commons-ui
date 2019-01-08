// Modified from https://github.com/MaayanLab/x2k_web/blob/master/src/main/webapp/js/bargraph.js

import React from 'react'
import * as d3 from 'd3'

function drawBargraph(chart, bargraph_data) {
  console.log(bargraph_data)
  bargraph_data = bargraph_data.slice(0, 20).map((data) => data.meta);

  function sortByScore(data, score, dir) {
      if (dir == "desc") {
          data.sort(function (a, b) {
              return (a[score] > b[score]) ? 1 : ((b[score] > a[score]) ? -1 : 0);
          });
      } else {
          data.sort(function (a, b) {
              return (a[score] < b[score]) ? 1 : ((b[score] < a[score]) ? -1 : 0);
          });
      }
  }

  sortByScore(bargraph_data, "p-value", "asc");

  var svg = d3.select(chart),
      margin = {top: 10, right: 10, bottom: 70, left: 100},
      width = 1000 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

  var x = d3.scaleLinear().rangeRound([0, width]),
      y = d3.scaleBand().rangeRound([height, 0]).padding(0.3);

  var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  x.domain([0, d3.max(bargraph_data, function (d) {
      return -Math.log10(d["p-value"]);
  })]);
  y.domain(bargraph_data.map(function (d) {
      return JSON.stringify(d);
  }));

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .attr("font-size", "1.3rem");

  // X-axis caption
  g.select(".axis--x")
      .append("text")
      .attr("class", "caption")
      .attr("x", width / 2)
      .attr("y", margin.bottom / 1.6)
      .attr("dy", "0.71em")
      .attr("font-size", "1.2rem")
      .text("-log₁₀(p-value)");

  // X-axis ticks
  g.selectAll(".axis--x text")
      .attr("fill", "black")
      .attr("font-size", "1.3rem");

  // Bar names
  g.append("g")
      .attr("class", "axis axis--y")
      .attr("fill", "none")
      .call(d3.axisLeft(y).tickSize(0))
      .selectAll("text")
      .attr("fill", "black")
      .attr("font-size", "1.3rem")
      .text(function (d) {
          return d.split(/[_-]/)[0]
      });

  g.select(".axis--y path")
      .attr("display", "none");

  // Entering joins for bars
  g.selectAll(".bar")
      .data(bargraph_data)
      .enter()
      .append("g")
      .attr("class", "bar-container");

  var network_type = (chart === ".chea-chart") ? 'tf' : 'kinase',
      fill = network_type === 'tf' ? "#FF546D" : "#3e8cd6";

  // Drawing bars
  g.selectAll(".bar-container")
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", function (d) {
          return y(JSON.stringify(d));
      })
      .attr("width", function (d) {
          return x(-Math.log10(d["p-value"]));
      })
      .attr("height", y.bandwidth())
      .attr("fill", fill);

  // Values on bars
  g.selectAll(".bar-container")
      .append("text")
      .attr("class", "bar-label")
      .attr("text-anchor", "end")
      .attr("x", function (d) {
          return Math.max(x(-Math.log10(d["p-value"])) - 5, 80);
      })
      .attr("y", function (d) {
          return y(JSON.stringify(d)) + y.bandwidth() / 2;
      })
      .attr("dy", ".35em")
      .attr("fill", function (d) {
          if (Math.max(x(-Math.log10(d["p-value"])) - 5) < 80) {
              return "gray"
          }
          else {
              return "white"
          }
      })
      .attr("font-size", "1.3rem")
      .text(function (d) {
          return d["p-value"].toExponential(2);
      });
}

export class BarGraph extends React.PureComponent {
  constructor(props) {
    super(props)

    this.renderBargraph = this.renderBargraph.bind(this)
  }

  renderBargraph(ref) {
    drawBargraph(ref, this.props.data)
  }

  render() {
    return (
      <svg
        ref={this.renderBargraph}
        className="main"
        preserveAspectRatio="xMinYMin"
        viewBox="-18 -18 918 558"
      />
    )
  }
}
