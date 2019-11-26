---
layout: post
title: 'Neuromodularity'
date: 2019-11-12
thumbnail: thumbnail.png
dependencies:
---
{% raw %}

<style>
p    {text-align: justify;}
.center {
  margin: auto;
  display: table;
  padding: 10px;
}
</style>

{% endraw %}

# Geometric graphs 
When working with networks it is common to assume that edge properties and node properties are somewhat independent. Nodes often contain information about the entity they represent and edges describe the relationships between those entities. However in practice it is often the case that nodes may be embedded in some space of interested. Let us consider the case where nodes represent cities and edges are the roads between them. It is intuitive to assume that each node (i.e. city) is associated with some coordinates. Given the coordinates of a node it is natural to assume that each link (i.e. road) has a certain length that might not be explicitly listed among the properties of those edges. 

These extra piece of information is induced by the the space in which the nodes are embedded thanks to some **distance metric** (e.g. Euclidean distance) defined on it.
When this extra information is avaible we can employ it to enrich the mechamism that shape our networks. For example we can decide that nodes are able to make connections only within a certain "range" define by that distance like in the sketch below.
{% raw %}
<div style="width:iframe width px; font-size:80%; text-align:center; padding-bottom:30px;"><iframe class="track center" frameborder="0" scrolling="no" onload="resizeIframe(this)" src="p5/geometricgraph/index.html"></iframe>
Moving the slider from <font color="green">local</font> to <font color="red">global</font> increases the range at which node can form connections. Click to sample new networks.
</div>
{% endraw %}
This embedding into a 2D space can open up many new possibilities. As we have seen before the generation of random networks can now rely on the new concept of "distance".
It is now possible to define a **local** connectivity (i.e. connecting preferentially to nodes at a short distance) vs **global** (i.e. connecting equally to nodes at every distance). 

This approach is called [Geometric Random Graph](https://en.wikipedia.org/wiki/Random_geometric_graph). In this type of network the connectivity is controlled by a radius parameter, such that each node wires with all the nodes within that radius. Below you can see how the number of links and connected components vary as the radius parameter changes. The network starts off with no edges but as the connection radius increase the number of connected components quickly converges to a single giant component. We are employing a hard threshold (i.e. connections are made with every node within the range, and no nodes outside the range) for simplicity but other alternatives exist, where connections are made probabilistically and closer nodes have higher probabilities (i.e. gaussian probability decay as distance increases).

{% raw %}
<div style="width:iframe width px; font-size:80%; text-align:center; padding-bottom:30px;">
<iframe class="track center" frameborder="0" marginheight="20" marginwidth="35" scrolling="no" onload="resizeIframe(this)" src="p5/growingnets/index.html"></iframe>
<font color="green">Links</font> counts the number of edges formed with the current radius size while <font color="blue"> components</font> shows how many connected compoenents there are. Click to sample new networks.
</div>
{% endraw %}
If we consider **modularity** as the situation where connections between nodes belonging to the same module are more than those between different modules then we can see that the distance based approach leads can enrich the concept with a sense of distance based clustering.
In our examples nodes are sampled uniformly over the available space but if the nodes were to be clustered into groups their local connections would naturally end up leading to a concept of different take on modularity. 
Now modules are groups of nodes that are close together in space, and in virtue of their closeness the number of connections *within* the module is going to be higher than the number of connections *between* modules recovering the previous concept of modularity.

# Complex contagion
It is easy to draw a parallel between the geometric graphs we have been talking about and systems composed of many spatially embedded nodes such as the **neurons** in a brain. In the same way infectious individuals spread from a city to city, activity spikes are transmitted from neuron to neuron. However neural networks provide even richer dynamics than those already complex one of infection spreading. Neurons can interact with each other activity in complex non-linear ways, a behaviour called **complex contagion**. In social networks this behaviour is particularly common. As we can imagine when interacting with other people an idea that reaches us from many different directions is much more effective. We can try to approximate this scenario in the following way:
-   Neurons fire when the incoming impulses surpass a certain **threshold**.
-   Incoming impulses add up, but constantly **decay** (i.e. multiple simultaneous inputs are much more effective than multiple single ones).
-   Each time a neuron fires the threshold for firing is raised.

{% raw %}
<div style="width:iframe width px; font-size:80%; text-align:center; padding-bottom:30px;">
<iframe class="track center" frameborder="0" scrolling="no" onload="resizeIframe(this)" src="p5/threshold/index.html" align="middle"></iframe>
Forcing a neuron to <font color="red">fire</font> repeatedly with impulses coming from a single source is much harder than having multiple inputs coming from multiple neurons at the same time.
</div>
{% endraw %}

# Complex spreading dynamics
When these mechanisms (geometric embedding and complex contagion) are combined the results quickly increase in complexity. In the following sketch we can see them at work. A network that describes a collection of neurons has been generated using the rules we have introduced. Using the mouse wheel or clicking we can now excite one of the neurons to make it send acitvity spikes to its neighbours. When a lot of impulses are travelling along an edge the tickness increases and the color changes to red. Neurons' color also turn to red the closer they get to firing. As neurons start firing their size increases along with the thing grey circle around them that represents the spiking threshold. Feel free to experiment exciting different neurons and see how the activity spreads through the network. To keep the overall activity under control the amount of impulses tha can be present at any given time is capped. Also, since the threshold for spiking increases as the neurons keep spiking we can see that increasing the connectivity of the network the neurons will blow up incredibly before starting to deflate.
{% raw %}
<div style="width:iframe width px; font-size:80%; text-align:center; padding-bottom:30px;">
<iframe class="track center" frameborder="0" marginheight="20" marginwidth="35" scrolling="no" onload="resizeIframe(this)" src="p5/spiketrain/index.html"></iframe>
I: determines the threshold level, raising it activity will spread much less.<br/> 
r: represents the connection radius, raising it the number of edges will increase.<br/> 
Press reset to sample a new network. Use the mouse wheel or click to release tons of impulses.
</div>
{% endraw %}

# Neural reservoirs 
The topics we have introduced and discussed so far are particularly relevant for a specific branch of Machine Learning known as Reservoir Computing.
{% raw %}
<iframe class="track center" frameborder="0" marginheight="20" marginwidth="35" scrolling="no" onload="resizeIframe(this)" src="p5/inout/index.html"></iframe>
{% endraw %}

# The dangers of time

{% raw %}
<div style="width:iframe width px; font-size:80%; text-align:center; padding-bottom:30px;">
<iframe class="track center" frameborder="0" marginheight="20" marginwidth="35" scrolling="no" onload="resizeIframe(this)" src="p5/time/index.html"></iframe>
I: determines the threshold level, raising it activity will spread much less.<br/> 
r: represents the connection radius, raising it the number of edges will increase.<br/> 
Press reset to sample a new network. Use the mouse wheel or click to release tons of impulses.
</div>
{% endraw %}


{% raw %}
<script>
function resizeIframe(obj) {
obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
obj.style.width = obj.contentWindow.document.body.scrollWidth + 'px';
}
</script>
<script src="appear.js"></script>
<script>
appear({
init: function init(){
console.log('dom is ready');
},
elements: function elements(){
// work with all elements with the class "track"
return document.getElementsByClassName('track');
},
appear: function appear(el){
if(el.contentWindow.loop != undefined){
    el.contentWindow.loop();
    console.log(el.src, 'playing')
}
},
disappear: function disappear(el){
if(el.contentWindow.noLoop != undefined){
    el.contentWindow.noLoop();
    console.log(el.src,'stopped')
}
},
bounds: 200,
reappear: true
});
</script>
{% endraw %}
