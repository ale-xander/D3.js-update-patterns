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

const t = d3.transition().duration(1500)

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
        .attr('fill', 'orange')
        .attr('x', d => x(d.name))
        //new ending positions
        .transition(t)
            .attr("height", d => graphHeight - y(d.orders))
            .attr('y', d => y(d.orders))

    //append enter selection to DOM
    rects.enter()
        .append('rect')
        
        //starting condition
        .attr("height", 0)
        .attr('y', graphHeight)
        .attr('fill', 'orange')
        .attr('x', d => x(d.name))
        //ending conditions below
        .transition(t)
            .attrTween('width', widthTween)
            .attr('y', d => y(d.orders))
            .attr("height", d => graphHeight - y(d.orders))
        

    //call axes
    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);
 
}

let data = []
// get data from firestore, listen for snapshot change
db.collection('menu-items').onSnapshot(res => {
    console.log(res.docChanges())
    res.docChanges().forEach(change => {
        // console.log(change.doc.data())
        const doc = {...change.doc.data(), id: change.doc.id}
        console.log(doc)
        switch (change.type) {
            case 'added':
                data.push(doc)
                break;
            case 'modified':
                //cahnge doc in array if the id of the snapshot matches
                const index = data.findIndex(item => item.id == doc.id);
                data[index] = doc;
                break;
            case 'removed':
                //if true item remain in array, otherwise it's removed
                data = data.filter(item => item.id != doc.id)
                break;
            default:
                break;
        }
    });
    update(data)
})

// ====================== TWEENS ======================
const widthTween = () => {
    //define interpolation
    let i = d3.interpolate(0, x.bandwidth());
    // i is a function that you can pass either 0 (which returns 0) or 1 (which return x.bandwidth)
    // this is a time ticker. if you send it a 0.5 it will give you the midpoint between 0 and x.bandwidth
    // returns a position during the transition

    // returns a function which takes ina time ticker t. t represents the different stages thru the transition that it's currntly in
    return function(t){
        //return the value from passing the ticker into the interpolation
        return i(t)
    }
}