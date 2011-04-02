#Deltacloud API javascript client
- prototype, everything can change
- tested only with Virtualmaster's native implementation of Deltacloud API
- requires Base64 from here: http://www.webtoolkit.info/javascript-base64.html
- requires jQuery
- caches responses


##Example
<tt>d = new Deltacloud(url, username, password)</tt>

<tt>d.instances()</tt>

<tt>d.images()</tt>

<tt>d.realms()</tt>

<tt>d.harware_profiles()</tt>

<tt>d.instance(id)</tt>

<tt>d.image(id)</tt>

<tt>d.realm(id)</tt>

<tt>d.hardware_profile(id)</tt>

cache example:
<tt>d.cache.instances</tt>

<tt>d.cache.images</tt>

etc...

##TODO
- create new instance
- perform actions on instances
- more DRYer solution for: sanitizing first level of response to array, returning first level of every single object 
- try to eradicate Base64 library used for assembling http basic auth header
- eradicate jQuery
