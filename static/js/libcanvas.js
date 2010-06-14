// Images arrays
var all_imgs = [];
var imagesLoaded = 0;
var imagesToPreload = 0;
// Sounds array
var audios = [];
var loadedAudioElements = 0;
var toloadAudioElements = 0;

// For FPS
var fps = 0;
var lasttime = 0;
var frame = 0;



var Point = $.inherit({
  __constructor : function( x, y ){
	this.x = x;
	this.y = y;
  },

  role: function(){
    return "point";
  },

  doAnim: function(){
  },

  render: function( ctx ){
	ctx.beginPath();
	ctx.lineWidth = 1;
	ctx.lineCap = 'square';
	ctx.strokeStyle = 'rgba(255,255,255,1)';
	var locx = this.x+game.origin.x;
	var locy = this.y+game.origin.y;
	ctx.moveTo(locx-0.5, locy-0.5);
	ctx.lineTo(locx+0.5, locy-0.5);
	ctx.lineTo(locx+0.5, locy+0.5);
	ctx.lineTo(locx-0.5, locy+0.5);
	ctx.lineTo(locx-0.5, locy-0.5);
	ctx.stroke();
  },

  info: function(){
    return this.x + "/" + this.y + "est un " + this.role();
  }
});


var Obj = $.inherit( Point, {
  __constructor : function( x, y, img_name ){
	this.x = x;
	this.y = y;
	this.img_name = img_name;
  },
  role : function(){
    return "obj";
  },
  render : function( ctx ) {
	ctx.drawImage( this.img, Math.floor(this.x-this.w/2)+game.origin.x, Math.floor(this.y-this.h/2)+game.origin.y, this.w, this.h );
	if( this.ind ) {
		ctx.fillStyle = "#fff";
		ctx.font = 'arial 5px';
		//ctx.fillText( this.ind, Math.floor(this.x-this.w/2)+4, Math.floor(this.y-this.h/2)+10 );
		//ctx.fillText( this.obj_id, Math.floor(this.x-this.w/2)+4, Math.floor(this.y-this.h/2)+18 );
	}
  }
});

var Cursor = $.inherit( Point, {
  doAnim: function( game ){
    this.x = game.mouse.x - game.origin.x;
    this.y = game.mouse.y - game.origin.y;
  },

  role : function(){
    return "cursor";
  }
});


var logs = [];
debug = function( s ) {
	//$("#debug").append( "DBG: "+txt+"\n" );
	logs.push( s );
	if( logs.length>80 )
		logs.splice( 0, 1 );
	$("#debug").html( logs.join( "<br>" ) ).get(0).scrollTop = $("#debug").get(0).scrollHeight;
}


var LSGame = $.inherit({
// function LSGame( canvas ) {
  __constructor : function( canvas ) {
	//this.canvas = canvas;
	this.ctx = document.getElementById( "hs_canvas" ).getContext('2d');
	this.logs = [];
	this.origin = new Point( 152, 10 );
	// Game objects
	this.objs = [];
	this.explosions = [];
	this.cursor = new Cursor();
	this.mouse = new Point();
	
	$('#hs_canvas').mousemove(function(e) {
		game.mouse.x = e.pageX - $(this).parent().get(0).offsetLeft;
		game.mouse.y = e.pageY - $(this).parent().get(0).offsetTop;
		//game.debug( game.mouse.info() );
	});
	$("#hs_canvas").bind( "click", {o:this}, this.click );
  },
  click : function( e ) {
	o = e.data.o;
	if( o.state=="play" ) {
		$("#hs_canvas").trigger( "click_in_play" );
	} else if( o.state=="loose" ) {
		o.initLevel();
	} else if( o.state=="win" ) {
		o.initLevel();
	}
  },
  delObj : function( obj ) {
	//for( var id in this.objs ) {
	//	if( this.objs[id]==obj.obj_id ) {
			//this.objs.splice(obj.obj_id, 1);
			delete this.objs[obj.obj_id];
			//game.debug( "delObj: "+obj.obj_id+" ind:"+todelete.ind+" del:"+deleted.ind );
			//game.debug( "delObj: "+obj.obj_id+" ind:"+this.objs[obj.obj_id].ind+" l:"+len+"/"+this.objs.length );
		//}
	//}
	return true;
  },
  addObj : function( obj ) {
	obj.img = preloadImage( obj.img_name );
	obj.obj_id = this.objs.length;
	this.objs.push( obj );
	//if( this.objs[obj.obj_id] )
	//	debug( "addObj: "+obj.obj_id+" ind:"+this.objs[obj.obj_id].ind+" id:"+this.objs[obj.obj_id].obj_id );
	//this.objs[id].img = preloadImage( "/media/himesama/img/"+this.objs[id].img_name );
	return true;
  },
  init : function() {
	//for( var id in this.objs ) {
	//}
	//preloadImage( "/media/himesama/img/load_leaf.png" );
	//preloadImage( "/media/himesama/img/gun_tube.png" );
	loadImages();
	loadSounds();
  },
  start : function() {
	setInterval( drawAll, 40 );
  },
  drawBack : function( ctx ) {
	ctx.fillStyle = "#fff";
	ctx.font = '14px Arial';
	ctx.fillText( "lives: "+this.lives, 50, 310 );
  },
  debug : function( txt ) {
    debug( txt );
  },
/**
 * Animation loop
 */
  drawAll : function() {
	ctx = this.ctx;
	ctx.clearRect(0,0,800,600);
	ctx.save();
	
	this.drawBack( ctx );
	
	if( this.state=="play" ) {
	for( var id in this.objs ) {
		this.objs[id].doAnim( game );
	}
	
	for( var id in this.explosions ) {
		this.explosions[id].doAnim( game );
	}
	this.cursor.doAnim( game );
	
	for( var id in this.objs ) {
		this.objs[id].render( ctx );
	}

	for( var id in this.explosions ) {
		this.explosions[id].render( ctx );
	}
	}
	else if( this.state=="loose" ) {
		ctx.font = '16px Arial';
		ctx.fillText( "You loose, click to continue", 300, 200 );
	} else if( this.state=="win" ) {
		ctx.font = '16px Arial';
		ctx.fillText( "You win, click to go to next level", 300, 200 );
	}
	
	this.cursor.render( ctx );
	
	frame++;
	if( frame%50==0 ) {
		var curtime = (new Date()).getTime();
		fps = Math.floor( frame/((curtime-lasttime)/1000) );
		lasttime = curtime;
		frame = 0;
		//debug( fps );
	}
	ctx.fillStyle = "#fff";
	ctx.font = '14px Arial';
	ctx.fillText( fps+" fps", 10, 360 );
	
	ctx.restore();
  }
});

// Static methods
// TODO: find a clean way to do that
drawAll = function() {
	game.drawAll();
}


function loadImages() {
	//alert( imagesLoaded+" >= "+imagesToPreload );
        for( var i in all_imgs ) {
                load_image( all_imgs[i][1], all_imgs[i][0] );
        }
}

function load_image(img,uri) {
        //var img = new Image();
        img.onload = on_image_load_event;
        img.onerror = on_image_load_event;
        img.onabort = on_image_load_event;
        img.src = "/media/himesama/img/"+uri;
        return img;
}



function preloadImage(uri) {
        var i=0;
        for( i in all_imgs ) {
                if( all_imgs[i][0]==uri )
                        break;
        }
        if( all_imgs[i] && all_imgs[i][0]==uri ) {
                var img = all_imgs[i][1];
                //game.debug( "LOAD IMG [CACHED]: "+uri );
        } else {
                imagesToPreload++;
                //game.debug( "LOAD IMG: "+uri );
                var img = new Image();
                all_imgs.push( [uri,img] );
        }
        return img;
}

function on_image_load_event() {
        imagesLoaded++;
        if (imagesLoaded >= imagesToPreload) {
                //startGame();
                game.start();
        }
}


function loadSounds() {
	toloadAudioElements = audios.length-1;
	for( var ii in audios ) {
		var audioElement = audios[ii][1];
		audioElement.addEventListener("error", function() {
			//alert( "error"+this.src );
		}, true);
		audioElement.addEventListener("load", function() {
			loadedAudioElements++;
		}, true);
		audioElement.src = audios[ii][0];
		audioElement.load();
	}
}

function preloadSound( audioname ) {
	var src = "/media/himesama/snd/" + audioname;
	src = src.replace( "#", "%23" );
	for( var ii in audios )
		if( audios[ii][0]==src )
			break;
	if( audios[ii] && audios[ii][0]==src ) {
		var audioElement = audios[ii][1];
		//debug( "LOAD SOUND [CACHED]: "+src );
	} else {
		var audioElement = new Audio();
		//debug( "LOAD SOUND: "+src );
		audios.push( [src,audioElement] );
	}
	return audioElement;
}

