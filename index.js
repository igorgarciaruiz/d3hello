import * as d3 from 'd3';
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force';

const svg = d3.select('body')
    .append('svg')
    .attr('width', 500)
    .attr('height', 500)
    .style('border', '1px solid black');

let data = {
    nodes: JSON.parse(localStorage.getItem('nodes')) || [
        { id: 'root', label: 'Root' },
        { id: 'A', label: 'Node A', parentId: 'root' },
        { id: 'B', label: 'Node B', parentId: 'root' },
        { id: 'C', label: 'Node C', parentId: 'root' },
        { id: 'D', label: 'Node D', parentId: 'root' },
    ],
    links: JSON.parse(localStorage.getItem('links')) || [
        { source: 'root', target: 'A' },
        { source: 'root', target: 'B' },
        { source: 'root', target: 'B' },
        { source: 'root', target: 'C' },
        { source: 'root', target: 'D' },
    ],
};


svg.on("click", function (event) {
    // Log the click event to the console for debugging
    console.log('SVG clicked!', event);

    var coordinates = d3.pointer(event);

    // Log the calculated coordinates
    console.log('Click coordinates:', coordinates);

    // Generate a random ID for the new node
    var id = Math.random().toString(36).substring(7);

    // Create a new node at the click coordinates
    var newNode = { id: id, label: `Node ${id}`, parentId: 'root', x: coordinates[0], y: coordinates[1] };

    // Add the new node to the nodes array
    data.nodes.push(newNode);

    // Add a link from the root node to the new node
    data.links.push({ source: 'root', target: id });

    // Update localStorage
    localStorage.setItem('nodes', JSON.stringify(data.nodes));
    localStorage.setItem('links', JSON.stringify(data.links));

    // Recalculate layout
    update();
});


function update() {
    const stratifiedData = d3.stratify()(data.nodes)
        .sort((a, b) => d3.ascending(a.id, b.id));

    const treeLayout = d3.tree()
        .size([500, 500])
        .nodeSize([100, 100]);

    const treeData = treeLayout(stratifiedData);

    const simulation = forceSimulation(treeData.descendants())
        .force('link', forceLink(treeData.links()).id(d => d.id))
        .force('charge', forceManyBody())
        .force('center', forceCenter(250, 250))
        .on('tick', ticked);

    const link = svg.selectAll('.link')
        .data(treeData.links())
        .join('line')
        .attr('class', 'link');

    const node = svg.selectAll('.node')
        .data(treeData.descendants(), d => d.id);

    const nodeEnter = node.enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.x},${d.y})`);

    nodeEnter.filter(d => d.id === 'root')
        .append('circle')
        .attr('r', 40)
        .attr('fill', 'white')
        .attr('stroke', 'black');

    nodeEnter.filter(d => d.id !== 'root')
        .append('circle')
        .attr('r', 4)
        .attr('fill', 'black');

    nodeEnter.append('text')
        .attr('dy', 5)
        .text(d => d.data.label)
        .attr('text-anchor', 'middle');

    node.merge(nodeEnter);

    const nodeExit = node.exit().remove();

    simulation.nodes(treeData.descendants());
    simulation.force('link').links(treeData.links());
}
