declare var d3;

import {ElementRef, Renderer} from '@angular/core';
import {Graph, DataGraph, ColorsForScale} from './commun';

export class PieChart implements Graph {
  public datas : DataGraph[];
  public colors : ColorsForScale;
  public id : string;
  public required_files = [];

  protected color_scale : string[];
  protected href = window.location.href;

  constructor(datas : DataGraph[], color: ColorsForScale, id: string,
              public width = 960, public height = 500 ) {

      this.datas = datas;
      this.colors = color;
      this.id = id;
      if(color.end_color != undefined)
        this.setColorScale();
      else
        this.color_scale = ['rgb('+color.start_color.r+','+color.start_color.g+','+color.start_color.b+')'];
  }


  public setColorScale() {
    this.color_scale = [];
    var c1 = this.colors.start_color;
    var c2 = this.colors.end_color;
    var nb = this.colors.nb_color
    //Calcul des différence dans les tons
    var diff = {
      r: (c2.r-c1.r)/(nb-1),
      g: (c2.g-c1.g)/(nb-1),
      b: (c2.b-c1.b)/(nb-1)
    }
    var c = {r:0, g:0, b:0};

    for( let i=0; i < nb; i++ )
    {
      c.r = Math.round(c1.r+i*diff.r);
      c.g = Math.round(c1.g+i*diff.g);
      c.b = Math.round(c1.b+i*diff.b);
      this.color_scale.push('rgb('+c.r+','+c.g+','+c.b+')');
    }
  }

  public loadGraph() {
    var radius = Math.min(this.width, this.height)/2 - 70;

    var colors = d3
    .scale
    .ordinal()//<string>
    .range(this.color_scale);

    var arc = d3
    .svg
    .arc()//<d3.layout.pie.Arc<DataGraph>>
    .innerRadius(0)
    .outerRadius(radius);

    var pie = d3
    .layout
    .pie()//<DataGraph>
    .sort((a,b) => {
      if(a.label < b.label) return -1;
      else return 1;
    }).value((d) => {
      return d.value;
    });
    var svg = d3.select("#"+this.id).append('svg')
                  .attr('width', this.width).attr('height', this.height).attr("xmlns", "http://www.w3.org/2000/svg")
                  .append("g").attr("transform", "translate("+this.width/2+","+this.height/2+")");

  var gradient = svg.append('defs').selectAll('.gradient')
			.data(this.color_scale).enter().append("radialGradient")
			.attr("id", function(d,i){return "gradient" + i;})
			.attr("gradientUnits", "userSpaceOnUse")
			.attr("cx", "0").attr("cy", "0").attr("r", radius*2.5).attr("spreadMethod", "pad");
		gradient.append("stop").attr("offset", "0%").attr("stop-color", function(d){ return d;});
		gradient.append("stop").attr("offset", "30%")
			.attr("stop-color",function(d){ return d;})
			.attr("stop-opacity", 1);
		gradient.append("stop").attr("offset", "70%")
			.attr("stop-color",function(d){ return "black";})
			.attr("stop-opacity", 1);

    var g = svg.selectAll(".arc")
                .data(pie(this.datas))
                .enter()
                .append("g")
                .attr("class", "arc");

    g.append("path")
        .attr("fill", (d,i) => { return "url("+this.href+"#gradient"+i+")";})
        .attr('stroke', 'black')
        .attr("d", arc);
    g.append("text")
        .attr("transform", function(d) {
            return "translate(" + Math.cos(((d.startAngle + d.endAngle - Math.PI) / 2)) * (radius) + "," + Math.sin((d.startAngle + d.endAngle - Math.PI) / 2) * (radius) + ")";
        })
        .attr("dy", function(d) {
            var return_value;
            if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
                return_value = 5;
            } else {
                return_value = -7;
            }
            return return_value;
        })
        .attr("text-anchor", function(d) {
            var return_value;
            if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
                return_value = "beginning";
            } else {
                return_value = "end";
            }
            return return_value;
        })
        .text(function(d) {
            var percentage = (d.data.value / 100 ) * 100;
            return d.data.label  + " (" + percentage.toFixed(1) + "%)";
        });
  }
}
