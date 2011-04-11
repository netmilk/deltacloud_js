function make_base_auth(user, pass) {
  var tok = user + ':' + pass;
  var hash = Base64.encode(tok);
  return "Basic " + hash;
}


function Deltacloud(url,user,pass,connect_success,connect_error){
  //TODO last slash escaping of url variable  
  var encoded_auth
  encoded_auth = make_base_auth(user,pass);
  
  this.cache = {}

  //CACHE functions for single item lookups by id
  this.cache.instance = function(){}
  this.cache.image = function(){}
  this.cache.hardware_profile = function(){}
  this.cache.relam = function(){}

  //GET REQUEST
  var get_request = function(request_url, success, error){
    console.log("Querying url: " + request_url);  

    var async = true;
    if(typeof(success) == "undefined"){ 
      async = false;
    } else {
      async = true;
    }
    console.log("Async: " + async);  
 
    response = $.ajax({
      url: request_url,
      type: "GET",
      dataType: "json",
      async: async,
      cache: false,
      beforeSend: function(req) {
        req.setRequestHeader('Authorization', encoded_auth);
      },
      success: function(data) {
        //TODO log url and data
        console.log("Success! ");
        if (async == true){
          success(data)
        }
      },

      error: function(request, status, error) {
        console.log("Error status " + status);
        console.log("Error request status text: " + request.statusText);
        console.log("Error request status: " + request.status);
        console.log("Error request response text: " + request.responseText);
        console.log("Error response header: " + request.getAllResponseHeaders());
        if (async == true){
          error(error)
        }
      }
    })
    
    if (async == false){    
      if(response.status == 200){
        return $.parseJSON(response.responseText)  
      } else{
        return false
        // error
      }
    }
  }

  //POST REQUEST
  var post_request = function(request_url, data){
    console.log("Querying url: " + request_url);  

    var async = true;
    if(typeof(success) == "undefined"){ 
      async = false;
    } else {
      async = true;
    }
    console.log("Async: " + async);  

    response = $.ajax({
      url: request_url,
      data: data,
      type: "POST",
      dataType: "json",
      async: async,
      cache: false,
      beforeSend: function(req) {
        req.setRequestHeader('Authorization', encoded_auth);
      },
      success: function(data) {
        //TODO log url and data        
        console.log("Success! " );
        if (async == true){
          success(data)
        }

      },

      error: function(request, status, error) {
        //FIXME handle non json response here
        console.log("Error status " + status);
        console.log("Error request status text: " + request.statusText);
        console.log("Error request status: " + request.status);
        console.log("Error request response text: " + request.responseText);
        console.log("Error response header: " + request.getAllResponseHeaders());
        if (async == true){
          error(error)
        }

      }
    })
    if (async == false){
      if(response.status == 200){
        return $.parseJSON(response.responseText)  
      } else{
        return false
        // error
      }
    }
  }



  //CONNECT    
  if(typeof(connect_success) == 'undefined'){
    //sync connect
    connection_response = get_request(base_url);
    if(connection_response == false){
      this.connected = false;   
    } else {
      this.connected = true;      
      this.api_version = connection_response.api.version;
      this.driver = connection_response.api.driver;
    }
  } else {
    //async connect
     get_request(base_url, function(connection_response){
      //this.connected = true;      
      //this.api_version = connection_response.api.version;
      //this.driver = connection_response.api.driver;
      connect_success();
     },function(){
       alert();
     })
  }
   
  //FILL CACHE - only sync mode - blocking
  this.fill_cache = function(){
    this.instances();
    this.images();
    this.realms();
    this.hardware_profiles();
  }

  //TOOLS
  var refactor_instance_actions = function(instance){
    // refactor instance actions as functions
    //TODO make this more general, transform every link in object to array with list of available functions and method for each of them
  
    var array_to_return = [];
    //making action names as keys of returning object
    $.each(instance.actions.link, function(index, link){
      array_to_return.push(link.rel);
    })

    //FIXME expecting there's no action called 'link'
    // empty link after refactoring

    var object_to_return = {};

    $.each(instance.actions.link, function(index, link){
      object_to_return[link.rel] = {}
      object_to_return[link.rel].method = link.method;
      object_to_return[link.rel].href = link.href;
    })

    instance.actions_details = object_to_return;
    instance.actions = array_to_return;

    //add dynamic methods by action names
    $.each(instance.actions_details, function(action,details){
      instance[action] = function(){
        //FIXME select according ajax method by action method
        post_request(details.href,{})
      }
    })  
    
    return instance
  }


  var normalize_response_to_array_and_transform = function(object, singular_name, transformation){
    // if first level (singular name) is object it is transformed to array with object and on each object in array is performed transformation
    // this behavior may by bug in rails virtualmaster's implementatin of json
    // in retrieved json is not single object returnerd as array with single object but only given object
  
    // handle if no transformation is given
    if(typeof(transformation) == 'undefined'){
      // return input as-is
      var transformation = function(item){return item};
    }

    var to_iterate;

    if($.isArray(object[singular_name + "s"][singular_name])){
      to_iterate = object[singular_name + "s"][singular_name];
    } else {
      to_iterate = object[singular_name + "s"];      
    }

    var to_return = [];   
    $.each(to_iterate, function(key,item){
      to_return.push(transformation(item))
    });

    return to_return;
  }  

  //DYNAMICALLY DECLARE LISTS OF ENTITIES
  //entity example {singular: "entity", plural: "entities"}
  entities = [
    {singular: 'instance', plural: 'instances'},
    {singular: 'image', plural: 'images'},
    {singular: 'realm', plural: 'realms'},  
    {singular: 'hardware_profile', plural: 'hardware_profiles'}
  ]

  var declare_list_of_entities = function(entity) {
    Deltacloud.prototype[entity.plural] = function(success,error){
      //function to use to handle repsonse
      var normalize_response = function(response) {
        if(entity.singular == "instance") {
          return normalize_response_to_array_and_transform(response, entity.singular, function(item){ return refactor_instance_actions(item)})
        } else {
          return normalize_response_to_array_and_transform(response, entity.singular)        
        }
      }

      if( typeof(success) == 'undefined'){ 
        // sync request
        request = get_request(url + "/"+ entity.plural)

        // sync request failed
        if( request == false ){ return false };

        //fill cache and return
        return this.cache[entity.plural] = normalize_response(request) 
      } else {
        //async reuest
        get_request(url + "/"+ entity.plural, function(data){
          //async succes execution
          success(normalize_response(data))
        },function(error){
         alert(error);
         })
      };
    };
  };

  //declare function for each entity
  for(var i=0; i<entities.length; i++) {
    entity = entities[i];
    declare_list_of_entities(entity)
  };

  //DYNAMICALLY DECLARE METHODS FOR DIRECT ACCESS TO EACH ENTITY
  var declare_access_to_entity = function(entity){ 
    Deltacloud.prototype[entity.singular] = function(id,success,error){ 
      //function to use to handle repsonse
      var normalize_item = function(item) {
        if(entity.singular == "instance") {
          return refactor_instance_actions(item);
        } else {
          return response;
        }
      }

      if(typeof(success) == 'undefined') {
        //sync request
        response = get_request(url + "/"+entity.plural+"/" + id)
        if(response == false){
          return false
        } else {
          return normalize_item(response[entity.singular]) ;
        };
      } else {
        //sync request
        get_request(url + "/"+entity.plural+"/" + id, function(response){
          success(normalize_item(response[entity.singular])) ;
        },alert("error"))
      };
    };
  };

  //declare function for each entity
  for(var i=0; i<entities.length; i++) {
    entity = entities[i];
    declare_access_to_entity(entity)
  };

}
