var THEME = require('themes/flat/theme');
var BUTTONS = require('controls/buttons');
var FINGERS = require('fingers');
var TOUCH_STATES = require('pictureTouchStates');
var SCROLLER = require('mobile/scroller');



var whiteSkin = new Skin({fill:"#609988"});
var blackSkin = new Skin({fill:"black"});
var blueSkin = new Skin({fill:"blue"});
var purpleSkin = new Skin( { fill:"#D0E7C3" } );

var flickrStyle = new Style({font:"bold 22px Georgia", color:"#EEFDB8"});

var titleStyle = new Style({font:"bold 40px Georgia", color:"#EEFDB8"});
var buttonStyle = new Style({font:"15px", color:"#393E3D"});

var counterTitleStyle = new Style({font:"15px Courier New", color:"#393E3D"});
var comicTitleStyle = new Style({font:"25px Courier New", color:"#393E3D"});

var titleLabel = new Label({left:0, right:0, top:0, height: 25, string: "" , style: comicTitleStyle})
var counterLabel = new Label({left:0, right:0, top:20, height: 15, string: "" , style: counterTitleStyle})


var titleContainer= new Container({
	left: 0, right: 0, top: 0, bottom: 0,
	skin: whiteSkin,
	contents:[
		new Label({left:0, right:0, top:0, height: 50, string: "XKCD VIEWER", style: titleStyle})
	]
});

var xkcdContainer= new Container({
	left: 0, right: 0, top: 75, bottom: 225,
	skin: whiteSkin,
	contents:[
		
	]
});

var flickrTitleContainer= new Container({
	left: 0, right: 0, top: 305, bottom: 350,
	skin: blackSkin,
	contents:[
		new Label({left:0, right:0, top:0, height: 50, string: "A (semi) Related Flickr Photo:", style: flickrStyle})
	]
});


var flickrContainer= new Container({
	left: 0, right: 0, top: 350, bottom: 0,
	skin: whiteSkin, 
	contents:[
		
	]
});

var url = "http://xkcd.com/info.0.json"	
var flickrUrl = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=8d7abd1738474205615ecac6d7bfa1fe&format=json&page=1&per_page=1&tags=&nojsoncallback=1"

var todayNum = 1486;

counter = 0;

var updateUrl = "http://www.davey.com/media/1001/home-tree.png?width=960&height=520&quality=80&mode=crop"





Handler.bind("/getIP", {
	onInvoke: function(handler, message){
		handler.invoke(new Message(url), Message.JSON);
	},
	onComplete: function(handler, message, json){
	
	
	
		
	var PictureContainer = Container.template(function($) { 
		return {
			left: 10, right: 10, top: 40, bottom: 0, 
			skin: whiteSkin, 
			behavior: Object.create((PictureContainer.behaviors[0]).prototype), 
			contents: [
				Picture($, { left: 0, top: 0, name: 'picture', 
					behavior: Object.create((PictureContainer.behaviors[1]).prototype), 
					url: json.img, }),
			], 
	}});	
		
			
			PictureContainer.behaviors = new Array(2);
			PictureContainer.behaviors[0] = function(content, data, dictionary) {
				FINGERS.TouchBehavior.call(this, content, data, dictionary);
			}
			PictureContainer.behaviors[0].prototype = Object.create(FINGERS.TouchBehavior.prototype, {
				buildTouchStateMachine: { value: 
					function(container) {
						var allowRotation = true;												
							return TOUCH_STATES.buildPictureTouchStateMachine(container, container.picture, allowRotation);	// note we pass both the container and the picture to be manipulated here
					},
				},
				onCreate: { value: 
					function(container, data) {
						FINGERS.TouchBehavior.prototype.onCreate.call(this, container, data);		
							this.data = data;
							this.loaded = false
							container.active = true;
							container.exclusiveTouch = true;
							container.multipleTouch = true;
					},
				},
				onShowingStateComplete: { value: 
					function(container) {
					},
				},
				onPhotoViewChanged: { value: 
					function(container) {
					},
				},
			});
			PictureContainer.behaviors[1] = function(content, data, dictionary) {
				Behavior.call(this, content, data, dictionary);
			}
			PictureContainer.behaviors[1].prototype = Object.create(Behavior.prototype, {
				onLoaded: { value: 
					function(picture) {
						this.loaded = true
								this.fitType = "fit"						
								this.fitPicture(picture)
					},
				},
				fitPicture: { value: 
					function(picture) {
						if (this.loaded)
									TOUCH_STATES.fitPicture(picture, 0, this.fitType)
					},
				},
			});

        var zoomPicture = new PictureContainer();
            

		updateUrl = json.img;
		xkcdContainer.empty();
		xkcdContainer.add(zoomPicture);
		
		
		trace(zoomPicture.first);
		trace(zoomPicture);
		trace("URL:" + zoomPicture.behavior.url);
		trace("\n" + "BEHAVIOR:" +zoomPicture.behavior);
		
		
		var displayTitle = json.title;

		while (true){
			if (json.title.indexOf(" ") != -1){
				json.title = json.title.substring(0, json.title.indexOf(" ")) + "%20" + json.title.substring(json.title.indexOf(" ")+1, );
			} else {
				break;
			}
		}

		if(/^[a-zA-Z0-9- ]*$/.test(json.title.substring(0, 1)) == false) {
    			json.title = "";
		}
		flickrUrl = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=8d7abd1738474205615ecac6d7bfa1fe&format=json&page=1&per_page=1&tags=" + json.title; 
		if (json.alt.length != 0){
			flickrUrl += "," 
			flickrUrl += json.alt.substring(0, json.alt.indexOf(" "));
			flickrUrl += "&nojsoncallback=1";
		}
		xkcdContainer.empty();
		counter = json.num;
		if (displayTitle.length > 22){
			var tempindex = 0;
			if (json.title.indexOf("(") != -1){
				tempindex = displayTitle.indexOf("(");
			} else {
				var newSub = displayTitle.substring(0, 22);
				tempindex = newSub.lastIndexOf(" ");
			}
			titleLabel.string = displayTitle.substring(0, tempindex);
		} else {
			titleLabel.string = displayTitle;
		}
		if (counter == 0){
			counterLabel.string = "This comic is from " +json.month +  "/" + json.day + "/" + json.year ;
		} else {
			counterLabel.string = "This comic was from " +json.month +  "/" + json.day + "/" + json.year ;
		}

		xkcdContainer.add(titleLabel);
		xkcdContainer.add(counterLabel);		
		
		xkcdContainer.add(zoomPicture);
		
		
		application.invoke(new Message("/getFlickr"));
	}
});

Handler.bind("/getFlickr", {
	onInvoke: function(handler, message){
		handler.invoke(new Message(flickrUrl), Message.TEXT);
		
	},
	onComplete: function(handler, message, flickrjson){

	
		var jsonString = flickrjson;
		
		var idIndex = jsonString.indexOf("id");
		var serverIndex = jsonString.indexOf("server");
		var farmIndex = jsonString.indexOf("farm");
		var ownerIndex = jsonString.indexOf("owner");
		var secretIndex = jsonString.indexOf("secret");
		var titleIndex = jsonString.indexOf("title");
		
		var photoId = jsonString.substring(idIndex+5, ownerIndex-3);		
		var secretId = jsonString.substring(secretIndex + 9, serverIndex - 3);
		var serverId = jsonString.substring(serverIndex + 9, farmIndex - 3);
		var farmId = jsonString.substring(farmIndex + 7, titleIndex - 3);

		finalflickrUrl = "http://c4.staticflickr.com/" + farmId + "/" + serverId + "/" + photoId + "_" + secretId +".jpg" 
		
		//var flickrPicture = new Picture({left: 0, right: 0, top: 0, bottom: 10, url: finalflickrUrl,})


		
		var PictureContainer = Container.template(function($) { 
			return {
				left: 10, right: 10, top: 00, bottom: 10, 
				skin: whiteSkin, 
				behavior: Object.create((PictureContainer.behaviors[0]).prototype), 
				contents: [
					Picture($, { left: 0, top: 0, name: 'picture', 
						behavior: Object.create((PictureContainer.behaviors[1]).prototype), 
						url: finalflickrUrl, }),
				], 
		}});	
		
			
			PictureContainer.behaviors = new Array(2);
			PictureContainer.behaviors[0] = function(content, data, dictionary) {
				FINGERS.TouchBehavior.call(this, content, data, dictionary);
			}
			PictureContainer.behaviors[0].prototype = Object.create(FINGERS.TouchBehavior.prototype, {
				buildTouchStateMachine: { value: 
					function(container) {
						var allowRotation = true;												
							return TOUCH_STATES.buildPictureTouchStateMachine(container, container.picture, allowRotation);	// note we pass both the container and the picture to be manipulated here
					},
				},
				onCreate: { value: 
					function(container, data) {
						FINGERS.TouchBehavior.prototype.onCreate.call(this, container, data);		
							this.data = data;
							this.loaded = false
							container.active = true;
							container.exclusiveTouch = true;
							container.multipleTouch = true;
					},
				},
				onShowingStateComplete: { value: 
					function(container) {
					},
				},
				onPhotoViewChanged: { value: 
					function(container) {
					},
				},
			});
			PictureContainer.behaviors[1] = function(content, data, dictionary) {
				Behavior.call(this, content, data, dictionary);
			}
			PictureContainer.behaviors[1].prototype = Object.create(Behavior.prototype, {
				onLoaded: { value: 
					function(picture) {
						this.loaded = true
								this.fitType = "fit"						
								this.fitPicture(picture)
					},
				},
				fitPicture: { value: 
					function(picture) {
						if (this.loaded)
									TOUCH_STATES.fitPicture(picture, 0, this.fitType)
					},
				},
			});


		var flickrFoto = new PictureContainer()

		flickrContainer.empty();
		flickrContainer.add(flickrFoto);

	}
});

// create buttons 
			var backButton, forwardButton;
			
			var backButtonBehavior = function(content, data){
				BUTTONS.ButtonBehavior.call(this, content, data);
			}
			backButtonBehavior.prototype = Object.create(BUTTONS.ButtonBehavior.prototype, {
				onTap: { value:  function(button){	
					if (counter == 0){
						url = "http://xkcd.com/1/info.0.json"
						application.invoke(new Message("/getIP"));
					} else {
						counter = counter - 1;
						url = "http://xkcd.com/" + counter + "/info.0.json"		
						application.invoke(new Message("/getIP"));
					}

				}}
			});
			
			var forwardButtonBehavior = function(content, data){
				BUTTONS.ButtonBehavior.call(this, content, data);
			}
			forwardButtonBehavior.prototype = Object.create(BUTTONS.ButtonBehavior.prototype, {
				onTap: { value:  function(button){
				
					if (counter == todayNum){
						url = "http://xkcd.com/info.0.json"
						application.invoke(new Message("/getIP"));
					} else {
						counter = counter + 1;
						url = "http://xkcd.com/" + counter + "/info.0.json"
						application.invoke(new Message("/getIP"));
					}
				}}
			});
			
			
			var randomButtonBehavior = function(content, data){
				BUTTONS.ButtonBehavior.call(this, content, data);
			}
			randomButtonBehavior.prototype = Object.create(BUTTONS.ButtonBehavior.prototype, {
				onTap: { value:  function(button){
						counter = Math.floor((Math.random() * 1483) + 1);
						url = "http://xkcd.com/" + counter + "/info.0.json"
						application.invoke(new Message("/getIP"));
				}}
			});

var forwardButtonTemplate = BUTTONS.Button.template(function($){ return{
	top: 50, bottom:465, left:20, right:220,
	contents:[
		new Label({left:0, right:0, height:25, string:"<==  Recent", style:buttonStyle})
	],
	behavior: new forwardButtonBehavior
}});

var randomButtonTemplate = BUTTONS.Button.template(function($){ return{
	top: 50, bottom:465, left:120, right:120,
	contents:[
		new Label({left:0, right:0, height:25, string:"RANDOM", style:buttonStyle})
	],
	behavior: new randomButtonBehavior
}});
	
var backButtonTemplate = BUTTONS.Button.template(function($){ return{
	top: 50, bottom:465, left:220, right:20,
	contents:[
		new Label({left:0, right:0, height:25, string: "Previous  ==>", style:buttonStyle})
	],
	behavior: new backButtonBehavior
}});


var button = new backButtonTemplate({});
var button2 = new forwardButtonTemplate({});
var button3 = new randomButtonTemplate({});


var mainCon = new Container({left:0, right:0, top:1000, bottom:0, skin: whiteSkin});


application.behavior = Object.create(Behavior.prototype, {	
	onLaunch: { value: function(application, data){
		application.add(titleContainer);
		application.add(xkcdContainer);
		application.add(flickrTitleContainer);
		application.add(flickrContainer);	
		titleContainer.add(button);
		titleContainer.add(button2);
		titleContainer.add(button3);
		
				
		
		application.invoke(new Message("/getIP"));		
	}}
});



