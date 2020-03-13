---
layout: post
title: 'Infectious Patterns.'
date: 2019-02-17
thumbnail: thumbnail.png
dependencies:
---

{% raw %}
<script>
function resizeIframe(obj) {
obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
obj.style.width = obj.contentWindow.document.body.scrollWidth + 'px';
}
</script>
{% endraw %}

# Infections

What happens when an infected little vector starts visiting nodes in an unsuspecting network? In the sketch below we can try to drop in some nasty vectors in an otherwise peaceful network and see what happens.

{% raw %}
<iframe frameborder="0" marginheight="20" marginwidth="35" scrolling="no" onload="resizeIframe(this)" src="p5/graph_infection/index.html"></iframe>
{% endraw %}

# Patterns
Imagine now that we were sitting in one of those unsuspecting nodes, minding our own business. No internet, no cellphones, no telegraphs, just us sitting placidly on our chair reading our favourite book.
If we were to take a look at the infected vectors that visit our little node what would we see? If the infection is spreading wildly we would likely see that their rate of arrival starts raising dramatically. Or maybe the infection is dying out and little by little fewer and fewer of them would visit our node.

Imagine now that we have no idea of what the network of nodes we are connected to looks like, what would we be able to discover about it just from keeping track of the times at which new vectors visit our own node? Let us consider a few simple scenarios in the following sketch (click to reset it).

{% raw %}
<iframe frameborder="0" marginheight="20" marginwidth="35" scrolling="no" onload="resizeIframe(this)" src="p5/patterns/index.html"></iframe>
{% endraw %}

That looks complicated. Even a simple pair of loops create quite irregular patterns. The situation is even worse if we consider that every possible path through the networks leads to a different "rhythm". In our little example we have very simple, color coded paths but in general the number of possible paths grows exponentially and... well good luck.

In order to make sense of this mess we are going to use some extra info. In our previous example signals are color coded based on the path they have followed but that's a bit like cheating isn't it. We cannot expect someone to go out and label all the paths in our network for us. But maybe we can get away with less detailed info, for example what about "age"?

Let us pretend that the new signals we input first in our network have `age = 0` and that whenever signals split at a node they generate "clones" with the same age as the original. All that's left to do is to periodically update their age and now we can keep track of how long incoming signals have been in the network for.

TODO
