---
layout: post
title: "Boring 40ine."
date: 2020-02-20
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

#wrapper {
    height: auto;
    width: 600px;
    margin: auto;
    padding-bottom: 30px;
    text-align: center;
    font-size: 80%;
}
#home1 {
    width: 47.5%;
    float: left;
    margin-right: 5%;
}

#home2 {
    width: 47.5%;
    float: right;
}

.column {
  float: 50%;
  padding: 5px;
}

.row {
  display: flex;
}
</style>

{% endraw %}


{% raw %}
<div style="width:iframe width px; font-size:80%; text-align:center; padding-bottom:30px;"><iframe class="track center" frameborder="0" scrolling="no" onload="resizeIframe(this)" src="p5/simul/index.html"></iframe>
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
