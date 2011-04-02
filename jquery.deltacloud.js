function make_base_auth(user, pass) {
  var tok = user + ':' + pass;
  var hash = Base64.encode(tok);
  return "Basic " + hash;
}


function Deltacloud(url,user,pass){
  //TODO cache 
  
  var encoded_auth
  encoded_auth = make_base_auth(user,pass);
  
   
  var get_request = function(request_url){
    //FIXME url slashes escaping    
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

  //FIXME url last slash escaping
   
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
      to_return.push(instance)
    });
  
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

    return to_return;
  };

  this.hardware_profiles = function(){ return get_request(url + "/hardware_profiles")};   
  this.realms = function(){ return get_request(url + "/realms")};   

  this.instance = function(id){ return get_request(url + "/instances/" + id)};
  this.image = function(id){ return get_request(url + "/images/" + id)};   
  this.hardware_profile = function(id){ return get_request(url + "/hardware_profiles/" + id)};   
  this.realm = function(id){ return get_request(url + "/realms/" + id)};   
}
