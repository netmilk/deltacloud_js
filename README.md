#Deltacloud API javascript client
- prototype, everything can change
- tested only with Virtualmaster's native implementation of Deltacloud API
- requires Base64 from here: http://www.webtoolkit.info/javascript-base64.html
- requires jQuery
- caches responses


##Example
connect: 

<tt>d = new Deltacloud(url, username, password)</tt>

create instance:

<tt>api.create_instance({image_id: 5, hwp_id: 2476,realm_id: "prague-l1-personal",name: "scout"})</tt>

<tt>d.instances()</tt>

actions:

<tt>d.instances()[1].actions</tt>

perform action:

<tt>d.instances()[1].reboot()</tt>


<tt>d.images()</tt>

<tt>d.realms()</tt>

<tt>d.harware_profiles()</tt>

<tt>d.instance(id)</tt>

<tt>d.image(id)</tt>

<tt>d.realm(id)</tt>

<tt>d.hardware_profile(id)</tt>

example how to access cache:

<tt>d.cache.instances</tt>

<tt>d.cache.images</tt>

etc...

##TODO
- create new instance
- TEST perform actions on instances 
- more DRYer solution for: sanitizing first level of response to array, returning first level of every single object 
- try to eradicate Base64 library used for assembling http basic auth header
- eradicate jQuery
- consider to have declared class for each member of instance,image,hwp,realm
- driver is mistycally blockong preceding actions, try to resolve eg. show loading modal window - it's killing user experience
- remove "magic" timestamp from url /services/deltacloud/instances?_=1301792300944 
- toggle sync / async mode, add callbacs to async mode
- consider declare functions dynamicaly from api capabilities