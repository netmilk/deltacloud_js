function make_base_auth(user, pass) {
  var tok = user + ':' + pass;
  var hash = Base64.encode(tok);
  return "Basic " + hash;
}


function Deltacloud(url,user,pass){
  
  var encoded_auth
  encoded_auth = make_base_auth(user,pass);
  
  this.cache = {}
  
  //GET REQUEST
  var get_request = function(request_url){
    console.log("Querying url: " + url);  
    response = $.ajax({
      url: request_url,
      type: "GET",
      dataType: "json",
      async: false,
      cache: false,
      beforeSend: function(req) {
        req.setRequestHeader('Authorization', encoded_auth);
      },
      success: function(data) {
        //TODO log url and data
        console.log("Success! " );
      },

      error: function(request, status, error) {
        console.log("Error status " + status);
        console.log("Error request status text: " + request.statusText);
        console.log("Error request status: " + request.status);
        console.log("Error request response text: " + request.responseText);
        console.log("Error response header: " + request.getAllResponseHeaders());
      }
    })
    if(response.status == 200){
      return $.parseJSON(response.responseText)  
    } else{
      return false
      // error
    }
  }

  //POST REQUEST
  var post_request = function(request_url, data){
    console.log("Querying url: " + url);  
    response = $.ajax({
      url: request_url,
      data: data,
      type: "POST",
      dataType: "json",
      async: false,
      cache: false,
      beforeSend: function(req) {
        req.setRequestHeader('Authorization', encoded_auth);
      },
      success: function(data) {
        //TODO log url and data        
        console.log("Success! " );
      },

      error: function(request, status, error) {
        //FIXME handle non json response here
        console.log("Error status " + status);
        console.log("Error request status text: " + request.statusText);
        console.log("Error request status: " + request.status);
        console.log("Error request response text: " + request.responseText);
        console.log("Error response header: " + request.getAllResponseHeaders());
      }
    })
    if(response.status == 200){
      return $.parseJSON(response.responseText)  
    } else{
      return false
      // error
    }
  }

  //TODO last slash escaping of url variable

  //CONNECT    
  connection_response = get_request(base_url);
  if(connection_response == false){
    this.connected = false;   
  } else{
    this.connected = true;      
    this.api_version = connection_response.api.version;
    this.driver = connection_response.api.driver;
  }
   

  
  // INSTANCES  
  this.instances = function(){ 
    request = get_request(url + "/instances")
   
    if( request == false ){ return false };

    var to_iterate;
    if($.isArray(request.instances.instance)){
      to_iterate = request.instances.instance;
    } else {
      to_iterate = request.instances;      
    }
  
    var to_return = [];   
    $.each(to_iterate, function(key,instance){
      to_return.push(refactor_instance_actions(instance))
    });
    
    
    this.cache.instances = to_return
    return to_return;
    };
  
  // IMAGES
  this.images = function(){ 
    request = get_request(url + "/images")
  
    if( request == false ){ return false };
  
    var to_iterate;
    if($.isArray(request.images.image)){
      to_iterate = request.images.image;
    } else {
      to_iterate = request.images;      
    }

    var to_return = [];   
    $.each(to_iterate, function(key,image){
      to_return.push(image)
    });

    this.cache.images = to_return
    return to_return;
  };

  // HARDWARE PROFILES
  this.hardware_profiles = function(){ 
    request = get_request(url + "/hardware_profiles")
  
    if( request == false ){ return false };
  
    var to_iterate;
    if($.isArray(request.hardware_profiles.hardware_profile)){
      to_iterate = request.hardware_profiles.hardware_profile;
    } else {
      to_iterate = request.hardware_profiles;      
    }

    var to_return = [];   
    $.each(to_iterate, function(key,hardware_profile){
      to_return.push(hardware_profile)
    });

    this.cache.hardware_profiles = to_return
    return to_return;
  };

  // REALMS
  this.realms = function(){ 
    request = get_request(url + "/realms")
  
    if( request == false ){ return false };
  
    var to_iterate;
    if($.isArray(request.realms.realm)){
      to_iterate = request.realms.realm;
    } else {
      to_iterate = request.realms;      
    }

    var to_return = [];   
    $.each(to_iterate, function(key,realm){
      to_return.push(realm)
    });

    this.cache.realms = to_return
    return to_return;
  };



  // INSTANCE
  this.instance = function(id){ 
    response = get_request(url + "/instances/" + id)
    if(response == false){
      return false
    } else {
      //FIXME return refactored instance
      return refactor_instance_actions(response.instance) 
    }
  };

  // IMAGE
  this.image = function(id){ 
    response = get_request(url + "/images/" + id)
    if(response == false){
      return false
    } else {
      return response.image 
    }
  };

  // HARDWARE PROFILE
  this.hardware_profile = function(id){ 
    response = get_request(url + "/hardware_profiles/" + id)
    if(response == false){
      return false
    } else {
      return response.hardware_profile 
    }
  };

  // HARDWARE PROFILE
  this.realm = function(id){ 
    response = get_request(url + "/realms/" + id)
    if(response == false){
      return false
    } else {
      return response.realm 
    }
  };

  // CREATE INSTANCE
  this.create_instance = function(data) {
    //TODO add validation to existence of image, hwp and realm
    response = post_request(url + "/instances",data);
    
    //FIXME return refactored instance
    return response;
  }
  
  
  // refactor instance actions
  var refactor_instance_actions = function(instance){

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
  
}
