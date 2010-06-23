/* This file is part of the Lunatic Systems Canvas Library
 *  Copyright (C) 2010 Adam Etienne <eadam@lunasys.fr>
 *
 *  This library is free software; you can redistribute it and/or
 *  modify it under the terms of the GNU Library General Public
 *  License as published by the Free Software Foundation; either
 *  version 2 of the License, or (at your option) any later version.
 *
 *  This library is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 *  Library General Public License for more details.
 *
 *  You should have received a copy of the GNU Library General Public License
 *  along with this library; see the file COPYING.LIB.  If not, write to
 *  the Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 *  Boston, MA 02110-1301, USA.
 */

var snds = {};
var game = null;

var Button = $.inherit( Obj, {
	__constructor : function( game, type ) {
		this.game = game;
		this.type = type;
		this.w = 50;
		this.h = 40;
		this.id = this.game.buttons.length;
		this.selected = false;
		var p = new Point( 0, 0 );
		this.attached_obj = this.game.createObjFromType( type, 'pos', p ); //new Coin( p, null, color );
		if( this.attached_obj ) {
			this.game.addObj( this.attached_obj );
		}
	},
	unSelect: function() {
		this.selected = false;
		//debug( "test remove element: "+this.game.cursor.attached_obj+" / "+this.selected );
	},
	select: function() {
		// Selection
		this.selected = true;
		if( this.attached_obj ) {
			if( this.game.cursor.attached_obj ) {
				this.game.delObj( this.game.cursor.attached_obj );
				this.game.cursor.attached_obj = null;
			}
			//var color = Math.floor( Math.random()*5 ) + 1;
			var p = new Point( this.game.cursor.x, this.game.cursor.y );
			//var c = this.game.createObjFromType( color, 'pos', p );
			var c = this.game.createObjFromType( this.attached_obj.type, 'pos', p );
			c.doAnim = function() {
				this.ind = game.getIndex( this );
				var p = game.getPosition( this.ind );
				this.x = p.x;
				this.y = p.y;
			}
			this.game.cursor.attached_obj = c;
			this.game.addObj( this.game.cursor.attached_obj );
			//debug( "attached obj"+c.obj_id );
		}
	},
	clickInside: function( mouse ) {
		if( mouse.x>this.x && mouse.x<this.x+this.w ) {
			if( mouse.y>this.y && mouse.y<this.y+this.h ) {
				//if( this.selected ) this.unSelect();
				//else this.select();
				return true;
			}
		}
		return false;
	},
	doAnim: function() {
		var margin = 1.1;
		this.x = (this.id % 2)*this.w*margin + this.game.buttons_area[0].x;
		this.y = Math.floor( (this.id/this.game.buttons.length) * this.h * margin * (this.game.buttons.length/2) ) + this.game.buttons_area[0].y;
		if( this.attached_obj ) {
			this.attached_obj.x = this.x - this.game.origin.x + this.w/2;
			this.attached_obj.y = this.y - this.game.origin.y + this.h/2;
		}
		//debug( this.id/this.game.buttons.length );
	},
	render: function( ctx ) {
		ctx.beginPath();
		ctx.lineWidth = 1;
		ctx.lineCap = 'square';
		if( this.selected )
			ctx.strokeStyle = 'rgba(255,50,50,1)';
		else
			ctx.strokeStyle = 'rgba(255,255,255,1)';
		var locx = this.x;
		var locy = this.y;
		ctx.moveTo(locx-0.5, locy-0.5);
		ctx.lineTo(locx+0.5+this.w, locy-0.5);
		ctx.lineTo(locx+0.5+this.w, locy+0.5+this.h);
		ctx.lineTo(locx-0.5, locy+0.5+this.h);
		ctx.lineTo(locx-0.5, locy-0.5);
		ctx.stroke();
	}
});


var Gun = $.inherit( Obj, {
	__constructor : function( game ){
		this.x = 315;
		this.y = 580;
		this.w = 43;
		this.h = 151;
		this.coin = null;
		this.game = game;
		this.img_name = "gun_tube.png";
		this.updateAngle();
		this.newCoin();
	},
	throwCoin: function( e ) {
		o = e.data.o;
		var p = new Point( o.x, 570 );
		angle = getAngle( p, o.game.cursor );
		if( angle<0 )
			angle = (getAngle( p, o.game.cursor ) + Math.PI/2);
		else
			angle = (getAngle( p, o.game.cursor ) - Math.PI/2);
		var speed = 10;
		var decy = getAdjacent( angle, speed );
		var decx = getOppose( angle, speed );
		var v = new Point( decx, -decy );
		o.coin.v = v;
		o.newCoin();
	},
	newCoin: function() {
		var s = new Point( 315, 500 );
		var color = Math.floor( Math.random()*5 ) + 1;
		this.coin = new GunCoin( s, null, color );
		this.game.addObj( this.coin );
		this.updateCoin();
		$("#hs_canvas").bind( "click_in_play", {o:this}, this.throwCoin );
	},
	updateCoin: function() {
		var s = new Point( 315, 580 );
		var ss = s;
		var decy = getAdjacent( this.angle, 105 );
		var decx = getOppose( this.angle, 105 );
		ss.x += decx;
		ss.y -= decy;
		//this.game.debug( "angle: " + this.angle + "x:" + ss.x + " y:"+ ss.y + " decx:" + decx + " decy:" + decy );
		this.coin.x = ss.x;
		this.coin.y = ss.y;
	},
	updateAngle : function(){
		//var p2 = this.game.cursor;
		//this.angle = getAngle( this.center, p2 )*2 - Math.PI;
		this.angle = getAngle( this, this.game.cursor );
		if( this.angle<0 )
			this.angle = (getAngle( this, this.game.cursor ) + Math.PI/2);
		else
			this.angle = (getAngle( this, this.game.cursor ) - Math.PI/2);
	},
	doAnim : function( game ){
		this.updateAngle();
		this.updateCoin();
		//game.debug( "angle:" + this.angle.toPrecision(2) + " angle raw:"+ getAngle( this, p2 ).toPrecision(2) );
	},
	render : function( ctx ){
		var a = this.angle;
		ctx.translate( this.x+game.origin.x, this.y+game.origin.y );
		//ctx.translate( this.x, this.y );
		ctx.rotate( a );
		ctx.drawImage( this.img, -Math.floor(this.w/2), -(this.h-40) );
		ctx.rotate( -a );
		ctx.translate( -this.x-game.origin.x, -this.y-game.origin.y );
		//ctx.translate( -this.x, -this.y );
	},
	role : function(){
		return "gun";
	}
});



//
// Abstract class for all object belonging to the level
//
var LevelObj = $.inherit( Obj, {
	__constructor : function( p, img_name ){
		this.__base( p, img_name );
	},
	addNewNeighbour : function( count, color ) {
		if( count>0 ) {
		   var c = this.getNeighbour();
		   for( i in c ) {
			  if( c[i] ) {
				 var lvl = game.getLevel();
				 if( lvl[c[i][0]]==null ) {
			/*
			// Alternative method to check if already added
			for( j in game.objs ) {
				if( game.objs[j].ind==c[i][0] )
					break;
			}
			if( game.objs[j].ind==c[i][0] )	// already exists
				continue;
			*/
			var p = game.getPosition( c[i][0] );
					var o = game.createObjFromType( color, 'pos', p ); //new Coin( p, null, color );
					if( game.addObj( o ) ) {
					   game.level[c[i][0]] = o;
					   //game.debug( "add id:"+c[i][0]+ " x:"+Math.round(p.x)+" y:"+Math.round(p.y)+" c:"+count );
					   o.addNewNeighbour( count-1, color );
					}
				 //} else {
				 //   c[i][1].color = this.color;
				 }
			  }
		   }
		}
	},
	getNeighbour : function() {
		var lvl = game.getLevel();
		var c = [];
		var yind = Math.round( (this.y-game.coin_h/2)/(game.coin_h*0.5) );
		if( yind%2==1 ) coef = 0;
		else coef = 1;
		if( this.ind>game.x_coins+1 ) c.push( [this.ind-game.x_coins-1+coef, lvl[this.ind-game.x_coins-1+coef]] );
		if( this.ind>game.x_coins*2 ) c.push( [this.ind-game.x_coins*2, lvl[this.ind-game.x_coins*2]] );
		if( this.ind>game.x_coins && this.ind%18>0 ) c.push( [this.ind-game.x_coins+coef, lvl[this.ind-game.x_coins+coef]] );

		if( this.ind<game.max_coins+game.x_coins-1 ) c.push( [this.ind+game.x_coins-1+coef, lvl[this.ind+game.x_coins-1+coef]] );
		if( this.ind<game.max_coins+game.x_coins*2 ) c.push( [this.ind+game.x_coins*2, lvl[this.ind+game.x_coins*2]] );
		if( this.ind<game.max_coins+game.x_coins ) c.push( [this.ind+game.x_coins+coef, lvl[this.ind+game.x_coins+coef]] );
		/*
		for( i in c )
		  if( c[i] )
			 game.debug( "ind: "+this.ind+" neighbour:"+c[i][0] );
		*/
		return c;
	},
});




//
// Abstract class for animated object in level
//
var AnimatedObj = $.inherit( LevelObj, {
	__constructor : function( p, img_name, max_frame ){
		this.__base( p, img_name );
		this.w = 25;
		this.h = 25;
		this.frame = 0;
		this.max_frame = max_frame;
	},
	doAnim : function() {
		this.frame += 0.2;
		if( this.frame>this.max_frame )
			this.frame = 0;
	},
	render : function( ctx ) {
		ctx.drawImage( this.img,  Math.floor(this.frame)*this.w, 0, this.w, this.h,  Math.floor(this.x-this.w/2)+game.origin.x, Math.floor(this.y-this.h/2)+game.origin.y, this.w, this.h );
	}
});


// Breakable stone
var Breakable = $.inherit( AnimatedObj, {
	__constructor : function( p ){
		this.__base( p, "breakable.png", 5 );
	},
	collide : function( color ) {
		game.delObj( this );
	}
});


// Unbreakable stone
var Unbreakable = $.inherit( AnimatedObj, {
	__constructor : function( p ){
		this.__base( p, "wall.png", 5 );
		this.w = 25;
		this.h = 23;
	},
	collide : function( color ) {
		this.addNewNeighbour( 2, color );
	}
});


var Wall = $.inherit( LevelObj, {
	__constructor : function( p ){
		var img_name = "stone"+rand(1,5)+".png";
		this.__base( p, img_name, 0 );
		this.w = 23;
		this.h = 23;
	},
	collide : function( color ) {
		game.delObj( this );
	}
});


var Gold = $.inherit( AnimatedObj, {
	__constructor : function( p ){
		this.__base( p, "coin.png", 28 );
		this.w = 23;
		this.h = 23;
	},
	collide : function( color ) {
		game.score += 500;
		game.delObj( this );
	}
});



var Hime = $.inherit( LevelObj, {
	__constructor : function( p ){
		this.__base( p, "hime.png" );
		this.w = 57;
		this.h = 67;
		this.frame = 0;
		this.animation = 0;
		this.animation_freq = Math.floor(Math.random()*60)+30;
		this.max_frame = 11;
		this.role = "hime";
	},
	collide : function( color ) {
		var lvl = game.getLevel();
		var hime_count = 0;
                game.level[this.ind] = null;
		for( var id in lvl ) {
			if( lvl[id] && lvl[id].role=="hime" )
				hime_count++;
		}
		game.delObj( this );
		if( hime_count==0 ) {
			//alert( hime_count );
			snds['win'].play();
			game.win();
		} else
			snds['free'].play();
	},
	doAnim : function( ctx ) {
		this.animation++;
		if( this.animation>this.animation_freq ) {
			this.frame+=0.4;
			if( this.frame>this.max_frame ) {
				this.frame = 0;
				this.animation = 0;
				this.animation_freq = Math.floor(Math.random()*60)+30;
			}
		}
	},
	render : function( ctx ) {
		ctx.drawImage( this.img,  Math.floor(this.frame)*this.w, 0, this.w, this.h,  Math.floor(this.x-this.w/2)+game.origin.x, Math.floor(this.y-this.h/2)+game.origin.y, this.w, this.h );
		//ctx.drawImage( this.img, Math.floor(this.x-this.w/2), Math.floor(this.y-this.h/2) );
		ctx.fillStyle = "#000";
		ctx.font = 'arial 10px';
		//ctx.fillText( "x:"+this.x+" y:"+this.y+" frame:"+this.frame, Math.floor(this.x)+4, Math.floor(this.y) );
	}
});



var CoinObj = $.inherit( LevelObj, {
	__constructor : function( p, v, color, role ){
		if( !( color>0 && color<6 ) )
			color = 1;
		this.__base( p, "el"+color+".png" );
		this.w = 25;
		this.h = 23;
		this.v = v;
		this.color = color;
		this.role = role;
		this.obj_id = 0;
	},
	doAnim : function( game ){
		if( this.v!=null ) {
			this.x += (this.v.x); //*this.x;
			this.y += (this.v.y); //*this.y;
			if( this.y>600 ) {
				game.delObj( this );
				//this.v = null;
			}
			if( this.x-this.w/2<0 ) {
				// Left
				this.v.x = -this.v.x;
			} else if( this.x+this.w/2>630 ) {
				// Right
				this.v.x = -this.v.x;
			}
			if( this.y-this.h/2<0 ) {
				this.v.y = -this.v.y;
			}
			this.lastind = this.ind;
			this.ind = game.getIndex( this );
			if( this.lastind!=this.ind )
				this.checkCollisions( game );
		}
	},
	checkCollisions : function( game ) {
		var lvl = game.getLevel();
		if( lvl[this.ind]!=null ) {
			game.delObj( this );
			lvl[this.ind].collide( this.color );
		}
	},
	collide : function( color ) {
		if( this.color==color ) {
			//game.debug( "this.destroyNeighbour ind:"+this.obj_id );
			this.destroyNeighbour();
		} else {
			//game.debug( "this.addNewNeighbour ind:"+this.ind );
			//lvl[this.ind].color = this.color;
			this.addNewNeighbour( 2, color );
		}
	},
	destroyNeighbour : function() {
		var i = 0;
		var c = this.getNeighbour();
		game.delObj( this );
		for( i in c ) {
			if( c[i] )
				if( c[i][1] && c[i][1].color==this.color )
						c[i][1].destroyNeighbour();
		}
		game.score += 10;
	},
	role : function(){
		return this.role;
	}
});


var Coin = $.inherit( CoinObj, {
	__constructor : function( p, v, color ){
		this.__base( p, v, color, "coin" );
	}
});


var GunCoin = $.inherit( CoinObj, {
	__constructor : function( p, v, color ) {
		this.__base( p, v, color, "guncoin" );
	},
});


var HSGame = $.inherit( LSGame, {
	__constructor : function( canvas, gamemode, level, x_coins, y_coins ){
	        // level=0, x_coins=17, y_coins=35
		this.__base( canvas );
		// Globals
		this.levels = {};
		this.gamemode = gamemode;
		this.coin_w = 25;
		this.coin_h = 23;
		this.x_coins = x_coins; //Math.floor(580/(this.coin_w*1.25));
		this.y_coins = y_coins; //Math.floor(630/(this.coin_h));
		this.max_coins = this.y_coins * this.x_coins;
         	//this.debug( "y_coins: "+this.y_coins+" x_coins:"+this.x_coins );
		
		if( this.gamemode=="editor" ) {
			// Editor mode
			$("#hs_canvas").bind( "click_in_play", {game:this}, this.editClick );
			var types = [1,2,3,4,5, 10, 11, 20, 30, 50];
			this.buttons_area = [ new Point( 20, 20 ), new Point( 140, 300 ) ];
			this.buttons = [];
			for( i in types ) {
				var b = new Button( this, types[i] );
				this.buttons.push( b );
				this.addObj( b );
			}
		} else {
			this.addObj( new Gun( this ) );
		}
		this.current_level = level;
		this.score = 0;
		this.lives = 3;
		this.state = "init";
	},
	drawScreen : function() {
		ctx.font = '16px Arial';
		if( this.state=="loose" ) {
			ctx.fillText( "You loose, click to continue", 300, 200 );
		} else if( this.state=="loose_real" ) {
			ctx.fillText( "You loose. Back to level 1", 300, 200 );
		} else if( this.state=="win" ) {
			ctx.fillText( "You win, click to go to next level", 300, 200 );
		}
	},
	click : function( e ) {
		var o = e.data.o;	// o is 'this' object, passed as argument because it's an event callback
		if( o.state=="play" ) {
			// Trigger a custom event
			$("#hs_canvas").trigger( "click_in_play" );
		} else {
			// Special screens
			if( o.state=="loose" || o.state=="loose_real" || o.state=="win" ) {
				o.loadLevel();
			}
		}
		return false;
	},
	loose : function() {
		// Loose
		if( this.state=="play" ) {
			snds['loose'].play();
			this.lives -= 1;
			if( this.lives<=0 ) {
				//alert( "You loose. Back to level 1" );
				this.state = "loose_real";
				this.current_level = 0;
				this.lives = 3;
			} else {
				this.state = "loose";
			}
		}
	},
	win : function() {
		// Win
		this.current_level++;
		this.state = "win";
	},
	cleanLevel : function() {
		for( var id in this.level ) {
			if( this.level[id] )
				this.delObj( this.level[id] );
		}
	},
	createObjFromType : function( t, idpos, id ) {
		if( idpos=="id" )
			var p = this.getPosition( id );
		else
			var p = id;
		var c = null;
		if( t>0 && t<6 ) {
			c = new Coin( p, null, t );
		} else if( t==10 ) {
			c = new Breakable( p );
		} else if( t==11 ) {
			c = new Wall( p );
		} else if( t==20 ) {
			c = new Gold( p );
		} else if( t==30 ) {
			c = new Unbreakable( p );
		} else if( t==50 ) {
			c = new Hime( p );
		}
		if( c )
			c.type = t;
		return c;
	},
	loadLevel : function() {
		var level = this.current_level;
		$.getJSON( "/r5/himesama/level/"+level+"/load", function (json) {
			game.levels[json.level] = json.elements;
			game.current_level = json.level;
			game.initLevel();
		} );
	},
	initLevel : function() {
		this.cleanLevel();
		var level_id = this.current_level;
		//alert( level_id );
		var lvl = this.levels[level_id];
		var level = [];
		for( var id in lvl ) {
			var t = lvl[id];
			var c = this.createObjFromType( t, 'id', id );
			if( c ) {
				this.addObj( c );
			}
			level.push( c );
		}
		this.setLevel( level );
		this.state = "play";
	},
	
	getLevel : function() { return this.level; },
	setLevel : function( lvl ) { this.level = lvl; },
	
	addObj : function( obj ) {
		if( obj.role=="coin" && obj.ind>this.max_coins-this.x_coins*2 ) {
			// If too low, loose
			this.loose();
			return false;
		}
		// Set the level index of this object here
		obj.ind = this.getIndex( obj );
		return this.__base( obj );
	},
	delObj : function( obj ) {
		if( obj && this.level[obj.ind]==obj ) {
			// Remove the object from the level
			this.level[obj.ind] = null;
		}
		this.__base( obj );
	},
	
	getIndex : function( o ) {
		// Return level index from Point
		p = new Point( o.x, o.y );
		p.x -= this.coin_w/4;
		p.y -= this.coin_h/2;
		//var yind = Math.floor( p.y/(this.coin_h*0.48) );
		var yind = Math.round( p.y/(this.coin_h*0.5) );
		if( yind%2==1 ) coef = 0;
		else coef = 1;
		var xind = Math.round( (p.x-coef*(this.coin_w*0.65))/(this.coin_w*1.5) );
		var id = yind*this.x_coins + xind;
		//this.debug( "x:"+Math.floor(p.x)+"y:"+Math.floor(p.y)+" xi:"+xind+"yi:"+yind+"co:"+coef+" id:"+id );
		return id;
	},
	getPosition : function( id ) {
		// Return Point from level index
		var yind = Math.floor( id/this.x_coins ) * this.x_coins;
		var y = Math.floor( id/this.x_coins ) * (this.coin_h*0.5);
		if( Math.floor( id/this.x_coins )%2==1 ) coef = 0;
		else coef = 1;
		var x = (id-yind)*(this.coin_w*1.5)+coef*(this.coin_w*0.75);
		//this.debug( "t:"+t+"x: "+x+"y: "+y+"yi:"+yind+"id:"+id );
		x += Math.round( this.coin_w/3 );
		y += Math.round( this.coin_h/2 );
		return new Point( x, y );
	},

	editClick: function( e ) {
		var g = e.data.game;
		if( g.mouse.x<g.buttons_area[1].x && g.mouse.y<g.buttons_area[1].y ) {
			for( i in g.buttons ) {
				if( g.buttons[i].clickInside( g.mouse ) ) {
					for( j in g.buttons ) {
						if( i!=j ) g.buttons[j].unSelect();
					}
					g.buttons[i].select();
					break;
				}
			}
			/*
			// Selection
			var color = Math.floor( Math.random()*5 ) + 1;
			var p = new Point( g.cursor.x, g.cursor.y );
			var c = g.createObjFromType( color, 'pos', p ); //new Coin( p, null, color );
			c.doAnim = function() {
				this.ind = game.getIndex( this );
				var p = game.getPosition( this.ind );
				this.x = p.x;
				this.y = p.y;
			}
			g.cursor.attached_obj = c;
			g.addObj( g.cursor.attached_obj );
			*/
		} else {
			if( g.cursor.attached_obj!=null ) {
				//alert( game.cursor.attached_obj.img_name );
				g.level[g.cursor.attached_obj.ind] = g.cursor.attached_obj;
				g.cursor.attached_obj = null;
			}
		}
		return false;
	},
});


function saveLevel() {
	var elts = [];
	for( var id in game.level ) {
		var elt = 0;
		if( game.level[id] ) {
			elt = game.level[id].type;
		}
		elts.push( elt );
	}
	var data = { 'elements': elts.join( "," ) };
	$.getJSON( "/r5/himesama/level/"+game.current_level+"/save", data, function (json) {
		alert( json['result'] );
	} );
}
