import * as React from 'react'
import * as d3 from 'd3'
import { scaleLinear } from 'd3-scale'

interface RunningSumDatum {
  x: number
  y: number
  b: number
}

export interface RunningSumProps {
  data: Array<RunningSumDatum>
  svgRef?: (ref: SVGElement) => void
}

export interface RunningSumState {
  ref?: SVGElement
}

export function dataFromResults({ input, output }: {
  input: {
    up: string[],
    down: string[],
  }
  output: {
    entities: string[],
    ranks: number[],
  },
}) {
  const { up, down } = input
  const { entities, ranks } = output

  var data = new Array();

  for(var i=0; i<ranks.length; i++){
    if(up.includes(entities[i])){
       
       data.push({"x": ranks[i], "y": -(ranks[i]-ranks.length/2)/(ranks.length/2), "b" : 1});
       console.log("1");
     }
     else if(down.includes(entities[i])){
       data.push({"x": ranks[i], "y": -(ranks[i]-ranks.length/2)/(ranks.length/2), "b" : -1});
     }
     else{
       data.push({"x": ranks[i], "y": -(ranks[i]-ranks.length/2)/(ranks.length/2), "b" : 0});
     }
  }
  
  data.sort(function(a,b) {
    return b.x - a.x;
  });
  
  data["columns"] = ["x", "y", "b"]

  return data
}

export class RunningSum extends React.Component<RunningSumProps, RunningSumState> {
  constructor(props: RunningSumProps) {
    super(props)
    this.state = {}
  }

  componentWillReceiveProps = (props: RunningSumProps) => {
    this.plotRunningSum()
  }

  updateRef = (ref) => {
    if (this.state.ref === undefined && ref !== undefined) {
      // React has initialized and we have a component ref
      this.setState({ ref }, () => {
        if (this.props.svgRef !== undefined) {
          this.props.svgRef(ref)
        }
        this.plotRunningSum()
      })
    }
  }

  plotRunningSum = () => {
    // Prepare variables
    const ref = this.state.ref
    const data = this.props.data

    // Can't do anything without the ref
    if (ref === undefined) {
      return
    }

    // Remove old content
    while (ref.firstChild) ref.removeChild(ref.firstChild)

    // Handle d3
    let running_up = [];
    let running_down = [];

    // set the dimensions and margins of the graph
    let margin = {top: 5, right: 20, bottom: 30, left: 70},
        width = 500 - margin.left - margin.right,
        height = 130 - margin.top - margin.bottom;

    let topheight = 400;

    // set the ranges
    let x = scaleLinear().range([0, width]);
    let y = scaleLinear().range([200, 0]);

    // define the line
    let valueline = d3.line<RunningSumDatum>()
        .x(function(d: RunningSumDatum) { return x(d.x); })
        .y(function(d: RunningSumDatum) { return y(d.y); });

    // running sum vizualization
    let svg2 = d3.select(ref).append("g").attr("id", "runningsums")
      .attr("width", width + margin.left + margin.right)
      .attr("height", 200 + margin.bottom)
      .attr("transform",
            "translate(" + margin.left + "," + 20 + ")");

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    let svg = d3.select(ref).append("g").attr("id", "enrichsvg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("transform",
              "translate(" + margin.left + "," + (200 + 2 * margin.top + margin.bottom) + ")");

    running_up = new Array(data.length+1);
    running_down = new Array(data.length+1);
    running_up[0] = 0;
    running_down[0] = 0;
    
    // format the data
    let counter = 1;
    for (const d of data) {
        d.x = +d.x;
        d.y = +d.y;
        d.b = +d.b;
        
        if(d.b == 1){
          running_up[counter] = running_up[counter-1] + 1;
          running_down[counter] = running_down[counter-1];
        }
        else if(d.b == -1){
          running_up[counter] = running_up[counter-1];
          running_down[counter] = running_down[counter-1] + 1;
        }
        else{
          running_up[counter] = running_up[counter-1];
          running_down[counter] = running_down[counter-1];
        }
        
        counter++;
    }
    
    let t1 = running_up[running_up.length-1]
    let t2 = running_down[running_down.length-1]
    
    let running_up_xy = [];
    let running_down_xy = [];
    
    let miny = 0;
    let maxy = 0;
    
    for(let i=0; i<running_up.length; i++){
      running_up[i] = (running_up[i]-(t1/running_up.length))/(t1)-i/(running_up.length);
      running_down[i] = (running_down[i]-(t2/running_down.length))/(t2)-i/(running_down.length);
      
      if(running_up[i] < miny){
        miny = running_up[i];
      }
      else if(running_down[i] < miny){
        miny = running_down[i];
      }
      
      if(running_up[i] > maxy){
        maxy = running_up[i];
      }
      else if(running_down[i] > maxy){
        maxy = running_down[i];
      }
      
      running_up_xy.push({x: i, y: +running_up[i]});
      running_down_xy.push({x: i, y: +running_down[i]});
    }
    
    let runningsum = d3.line<RunningSumDatum>()
      .x(function(d: RunningSumDatum) { return x(d.x); })
      .y(function(d: RunningSumDatum) { return y(d.y); });

    // Scale the range of the data
    x.domain([d3.min(data, function(d) { return d.x; }), d3.max(data, function(d) { return d.x; })]);
    //y.domain([d3.min(data, function(d) { return d.y; }), d3.max(data, function(d) { return d.y; })]);
    y.domain([miny, maxy]);
    
    console.log(maxy,miny);
    
    svg2.append("line")          // attach a line
      .style("stroke", "black")  // colour the line
      .style("stroke-width", "2")
      .attr("x1", -1)     // x position of the first end of the line
      .attr("y1", 200*(maxy/(maxy-miny)))      // y position of the first end of the line
      .attr("x2", width+1)     // x position of the second end of the line
      .attr("y2", 200*(maxy/(maxy-miny)));
    
    let relZero = height*d3.max(data, function(d) { return d.y; })/(d3.max(data, function(d) { return d.y; }) - d3.min(data, function(d) { return d.y; }))

    svg.append("line")          // attach a line
      .style("stroke", "black")  // colour the line
      .style("stroke-width", "2")
      .attr("x1", -1)     // x position of the first end of the line
      .attr("y1", relZero)      // y position of the first end of the line
      .attr("x2", width+1)     // x position of the second end of the line
      .attr("y2", relZero);

    let path2 = svg2.append("path")
        .data([running_up_xy])
        .attr("class", "upline")
        .attr("d", runningsum);
    
    let path3 = svg2.append("path")
        .data([running_down_xy])
        .attr("class", "downline")
        .attr("d", runningsum);
    
    
    // running sum plot stuff
    svg2.append("g")
        .attr("transform", "translate(-5,0)")
        .style("font", "16px arial")
        .call(d3.axisLeft(y).ticks(6))
        .style("stroke-width", "2");

    svg2.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.left)
          .attr("x", -75 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Enrichment Score");
    
    svg2.append("rect")
          .attr("x", 296)
          .attr("y", -4)
          .attr("width", 114)
          .attr("height", 42)
          .attr("fill", "white")
          .style("opacity", 0.6);
    
    svg2.append("rect")
          .attr("x", 300)
          .attr("y", 0)
          .attr("width", 14)
          .attr("height", 14)
          .attr("fill", "dodgerblue");
    
    svg2.append("text")
          .attr("y", 11)
          .attr("x", 320)
          .style("text-anchor", "start")
          .text("up genes");
    
    svg2.append("rect")
          .attr("x", 300)
          .attr("y", 20)
          .attr("width", 14)
          .attr("height", 14)
          .attr("fill", "firebrick");
          
    svg2.append("text")
          .attr("y", 32)
          .attr("x", 320)
          .style("text-anchor", "start")
          .text("down genes");
    
    y = d3.scaleLinear().range([height, 0]);
    y.domain([d3.min(data, function(d) { return d.y; }), d3.max(data, function(d) { return d.y; })]);
    
    // Add the valueline path.
    let path = svg.append("path")
        .data<RunningSumDatum[]>([data])
        .attr("class", "line")
        .attr("d", valueline);
    
    for(let i=0; i<data.length; i++){
      
      if(data[i].b == 1){
        svg.append("line")       // attach a line
          .style("stroke", "dodgerblue")  // colour the line
          .style("stroke-width", "2")
          .attr("x1", width/2)     // x position of the first end of the line
          .attr("y1", relZero-30)      // y position of the first end of the line
          .attr("x2", width/2)     // x position of the second end of the line
          .attr("y2", relZero-1)
        .transition()
          .duration(500)
          .attr("x1", i*width/(data.length-1))     // x position of the first end of the line
          .attr("y1", relZero-30)      // y position of the first end of the line
          .attr("x2", i*width/(data.length-1))     // x position of the second end of the line
          .attr("y2", relZero-1);
      }
      else if(data[i].b == -1){
        svg.append("line")          // attach a line
          .style("stroke", "firebrick")  // colour the line
          .style("stroke-width", "2")
            .attr("x1", width/2)     // x position of the first end of the line
            .attr("y1", relZero+30)      // y position of the first end of the line
            .attr("x2", width/2)     // x position of the second end of the line
            .attr("y2", relZero+1)
          .transition()
            .duration(500)
            .attr("x1", i*width/(data.length-1))     // x position of the first end of the line
            .attr("y1", relZero+30)      // y position of the first end of the line
            .attr("x2", i*width/(data.length-1))     // x position of the second end of the line
            .attr("y2", relZero+1);
      }
    }

    // Add the Y Axis
    svg.append("g")
        .attr("transform", "translate(-5,0)")
        .style("font", "16px arial")
        .call(d3.axisLeft(y).ticks(3))
        .style("stroke-width", "2");

    svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.left)
          .attr("x",0 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Gene Weights");

    svg.append("rect")
          .attr("y", height/2-36)
          .attr("x", width/2-36)
          .attr("width", 72)
          .attr("height", 22)
          .attr("fill", "white")
          .style("opacity", 0.6);

    svg.append("text")
          .attr("y", height/2-20)
          .attr("x", width/2)
          .style("text-anchor", "middle")
          .text("up genes");

    svg.append("rect")
          .attr("y", height/2+24)
          .attr("x", width/2-46)
          .attr("width", 92)
          .attr("height", 22)
          .attr("fill", "white")
          .style("opacity", 0.6);

    svg.append("text")
          .attr("y", height/2+40)
          .attr("x", width/2)
          .style("text-anchor", "middle")
          .text("down genes");
  }

  render = () => (
    <div>
      <style jsx global>{`
        .line {
          fill: none;
          stroke: black;
          stroke-width: 4px;
        }

        .upline {
          fill: none;
          stroke: dodgerblue ;
          stroke-width: 4px;
        }

        .downline {
          fill: none;
          stroke: firebrick;
          stroke-width: 4px;
        }

        .body {
          width: 500px;
          height: 350px;
        }

        @keyframes dash{
            from{
                stroke-dashoffset: 1000;
            }
            to{
                stroke-dashoffset: 0;
            }
        }
        
        .body {
          font-family: 'Roboto', sans-serif;
        }
      `}</style>
      {this.state.ref === undefined ? (
        <div>Loading...</div>
      ) : null}
      <svg ref={this.updateRef} className="body"></svg>
    </div>
  )
}

export default RunningSum
