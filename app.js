console.log('lol')
//define margins
const margin = {
    top: 20,
    right: 20,
    bottom: 100,
    left: 100
}

// append svg to the canvas class
const svg = d3.select('.canvas')
                .append('svg')
                .attr('width', 600)
                .attr('height', 600);

// create margins
const graphWidth = 600 - margin.left - margin.right;
const graphHeight = 600 - margin.top - margin.bottom;
const graph = svg.append('g')
                .attr('width', graphWidth)
                .attr('height', graphHeight)
                .attr('transform', `translate(${margin.left}, ${margin.top})`)

// create groups for the axes
const xAxisGroup = graph.append('g')
                        .attr('transform', `translate(0, ${graphHeight})`)// make x go to the bottom

const yAxisGroup = graph.append('g')

//scales
const y = d3.scaleLinear()
            .range([graphHeight, 0]);
const x = d3.scaleBand()
            .range([0, 500])
            .paddingInner(0.2)
            .paddingOuter(0.2);

//create and call the axes
const xAxis = d3.axisBottom(x)          
const yAxis = d3.axisLeft(y)
                .ticks(10)
                .tickFormat(d => d + ' orders')

                //update x axis text
xAxisGroup.selectAll('text')
            .attr('transform', 'rotate(-40)')
            .attr('text-anchor', 'end')
            .attr('fill', 'orange')



            //update function
const update = (data) =>{
    //update any scales that rely on data
    y.domain([0, d3.max(data, d => d.orders)])
    x.domain(data.map(item => item.name))

    //join updated data to elements
    const rects = graph.selectAll('rect') 
                        .data(data);
    
    //remove any unwanted rects from the DOM
    rects.exit().remove()

    //update current shapes in DOM
    rects.attr('width', x.bandwidth)
        .attr("height", d => graphHeight - y(d.orders))
        .attr('fill', 'orange')
        .attr('x', d => x(d.name))
        .attr('y', d => y(d.orders))

    //append enter selection to DOM
    rects.enter()
        .append('rect')
        .attr('width', x.bandwidth)
        // .attr("height", d => y(d.orders))
        .attr("height", d => graphHeight - y(d.orders))
        .attr('fill', 'orange')
        .attr('x', d => x(d.name))
        .attr('y', d => y(d.orders))
    
    //call axes
    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);
 
}

// get data from firestore
db.collection('menu-items').get().then(res => {
    // console.log(res)
    let data = [];
    res.docs.forEach(doc => {
        // console.log(doc.data())
        data.push(doc.data())
    });
    
    //update with new data from firestore
    update(data)
})

