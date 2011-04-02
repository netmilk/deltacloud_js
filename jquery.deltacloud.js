function make_base_auth(user, pass) {
  var tok = user + ':' + pass;
  var hash = Base64.encode(tok);
  return "Basic " + hash;
}


function deltacloud(url,user,pass){
   this.connected = false;
   this.api_version = undefined;
   this.driver = undefined;

   var encoded_auth
   encoded_auth = make_base_auth(user,pass);
   //FIXME url last slash escaping    
   
   this.instances = function(){ return get_request(url + "/instances")};
   this.images = function(){ return get_request(url + "/images")};   
   this.hardware_profiles = function(){ return get_request(url + "/hardware_profiles")};   
   this.realms = function(){ return get_request(url + "/realms")};   

   this.instance = function(id){ return get_request(url + "/instances/" + id)};
   this.image = function(id){ return get_request(url + "/images/" + id)};   
   this.hardware_profile = function(id){ return get_request(url + "/hardware_profiles/" + id)};   
   this.realm = function(id){ return get_request(url + "/realms/" + id)};   

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
}
