
function simulate(data,svg)
{
    const width = parseInt(svg.attr("viewBox").split(' ')[2])
    const height = parseInt(svg.attr("viewBox").split(' ')[3])
    const main_group = svg.append("g")
        .attr("transform", "translate(0, 50)")

   //calculate degree of the nodes:
    let node_degree={}; //initiate an object
   d3.map(data.links, (d)=>{
       if(d.source in node_degree)
       {
           node_degree[d.source]++
       }
       else{
           node_degree[d.source]=0
       }
       if(d.target in node_degree)
       {
           node_degree[d.target]++
       }
       else{
           node_degree[d.target]=0
       }
   })
   

    const scale_radius = d3.scaleLinear()
        .domain(d3.extent(Object.values(node_degree)))
        .range([3,12])
    const scale_link_stroke_width = d3.scaleLinear()
        .domain(d3.extent(data.links, d=> d.value))
        .range([1,5])



    console.log(node_degree)

    let countries = [...new Set(data.nodes.map(node => node.Country))];
    console.log(countries)

    const color = d3.scaleOrdinal()
        .domain(countries)
        .range(d3.schemeCategory10);


    const link_elements = main_group.append("g")
        .attr('transform',`translate(${width/2},${height/2})`)
        .selectAll(".line")
        .data(data.links)
        .enter()
        .append("line")
        .style("stroke-width", d=> scale_link_stroke_width(d.value));

    const node_elements = main_group.append("g")
        .attr('transform', `translate(${width / 2},${height / 2})`)
        .selectAll(".circle")
        .data(data.nodes)
        .enter()
        .append('g');
        //.attr("class",function (d){return "gr_"+d.group.toString()})
        

    node_elements.append("circle")
        .attr("r",  (d,i)=>{
            let radius = scale_radius(node_degree[d.id]);
            //console.log(`node ${i}: ${radius}`);
            return radius;
        })
        .attr("fill",  d=> color(d.Country))

    node_elements.append("text")
        .attr("class","label")
        .attr("text-anchor","middle")
        .text(d=>d.name)


    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    
    node_elements.on("click", function (event, d) {
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html("Title: " + d.Title + "<br/>Country: " + d.Country)
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseleave", function (d) {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    });

    d3.select("#link-strength").on("input", function() {
        ForceSimulation.force("link").strength(+this.value);
        ForceSimulation.alpha(1).restart();
    });
    
    d3.select("#collide").on("input", function() {
        ForceSimulation.force("collide").radius(+this.value);
        ForceSimulation.alpha(1).restart();
    });
    
    d3.select("#charge").on("input", function() {
        ForceSimulation.force("charge").strength(+this.value);
        ForceSimulation.alpha(1).restart();
    });

    let ForceSimulation = d3.forceSimulation(data.nodes)
        .force("collide",
            d3.forceCollide().radius((d,i)=>{return scale_radius(node_degree[d.id])*4}))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("charge", d3.forceManyBody())
        .force("link",d3.forceLink(data.links)
            .id(d=>d.id)
            /* .distance(d=>d.value)
            .strength(d=>d.value*.1) */
        )
        .on("tick", ticked);

    function ticked()
    {
    node_elements
        .attr('transform', (d)=>`translate(${d.x},${d.y})`)
        link_elements
            .attr("x1",d=>d.source.x)
            .attr("x2",d=>d.target.x)
            .attr("y1",d=>d.source.y)
            .attr("y2",d=>d.target.y)

        }

    svg.call(d3.zoom()
        .extent([[0, 0], [width, height]])
        .scaleExtent([0.5, 8])
        .on("zoom", zoomed));
    function zoomed({transform}) {
        main_group.attr("transform", transform);
    }

    d3.select("#reset-button").on("click", function() {
        // Reset the force simulation
        let ForceSimulation = d3.forceSimulation(data.nodes)
        .force("collide",
            d3.forceCollide().radius((d,i)=>{return scale_radius(node_degree[d.id])*4}))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("charge", d3.forceManyBody())
        .force("link",d3.forceLink(data.links)
            .id(d=>d.id)
            /* .distance(d=>d.value)
            .strength(d=>d.value*.1) */
        )
        .on("tick", ticked);
    
        // Reset the form values
        d3.select("#link-strength").property("value", 0.5);
        d3.select("#collide").property("value", 1);
        d3.select("#charge").property("value", -30);
        d3.selectAll('input[name="node-size"]').property("checked", false);
    });




}
