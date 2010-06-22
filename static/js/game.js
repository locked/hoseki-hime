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
					var o = new Coin( p, null, color );
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
	__constructor : function( canvas, gamemode ){
		this.__base( canvas );
		// Globals
		this.gamemode = gamemode;
		this.coin_w = 25;
		this.coin_h = 23;
		this.x_coins = 17; //Math.floor(580/(this.coin_w*1.25));
		this.y_coins = 35; //Math.floor(630/(this.coin_h));
		this.max_coins = this.y_coins * this.x_coins;
         	this.debug( "y_coins: "+this.y_coins+" x_coins:"+this.x_coins );
		
		if( this.gamemode=="editor" ) {
			// Editor mode
			$("#hs_canvas").bind( "click_in_play", {game:this}, this.editClick );
		} else {
			this.addObj( new Gun( this ) );
		}
		this.current_level = 0;
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
				o.initLevel();
			}
		}
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
	initLevel : function() {
		this.cleanLevel();
		var level_id = this.current_level;
		//alert( level_id );
		var lvl = this.levels[level_id];
		var level = [];
		for( var id in lvl ) {
			var t = lvl[id];
			var c = null;
			if( t>0 && t<6 ) {
				c = new Coin( this.getPosition( id ), null, t );
			} else if( t==10 ) {
				c = new Breakable( this.getPosition( id ) );
			} else if( t==11 ) {
				c = new Wall( this.getPosition( id ) );
			} else if( t==20 ) {
				c = new Gold( this.getPosition( id ) );
			} else if( t==30 ) {
				c = new Unbreakable( this.getPosition( id ) );
			} else if( t==50 ) {
				c = new Hime( this.getPosition( id ) );
			}
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
		if( obj.role=="coin" && obj.ind>game.max_coins-game.x_coins*2 ) {
			// If too low, loose
			game.loose();
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
		//p.x -= this.coin_w/3;
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
		if( g.mouse.x<g.origin.x ) {
			// Selection
			var color = Math.floor( Math.random()*5 ) + 1;
			var p = new Point( g.cursor.x, g.cursor.y );
			var c = new Coin( p, null, color );
			c.doAnim = function() {
				this.ind = game.getIndex( this );
				var p = game.getPosition( this.ind );
				this.x = p.x;
				this.y = p.y;
			}
			//var c = new Breakable( p );
			g.cursor.attached_obj = c;
			g.addObj( g.cursor.attached_obj );
		} else {
			if( g.cursor.attached_obj!=null ) {
				//alert( game.cursor.attached_obj.img_name );
				g.level[g.cursor.attached_obj.ind] = g.cursor.attached_obj;
				g.cursor.attached_obj = null;
			}
		}
	},
});




$(document).ready( function() {
	game = new HSGame( 'hs_board', gamemode );
	snds['win'] = game.preloadSound( "win.ogg" );
	snds['loose'] = game.preloadSound( "loose.ogg" );
	snds['free'] = game.preloadSound( "dropgood.ogg" );
	game.preloadImage( "wall.png" );
	game.preloadImage( "stone1.png" );
	game.preloadImage( "stone2.png" );
	game.preloadImage( "stone3.png" );
	game.preloadImage( "stone4.png" );
	game.preloadImage( "stone5.png" );
	game.preloadImage( "hime.png" );
	game.preloadImage( "coin.png" );
	game.preloadImage( "breakable.png" );
	game.preloadImage( "el1.png" );
	game.preloadImage( "el2.png" );
	game.preloadImage( "el3.png" );
	game.preloadImage( "el4.png" );
	game.preloadImage( "el5.png" );
	game.levels = [
	[ 4, 0, 0,  0,  0,  0, 0, 0, 0, 1,  0, 0, 0, 0,  0,  0, 1,
          0, 0, 0,  0,  0,  0, 0, 0, 0, 0,  0, 0, 0, 0,  0,  0, 0,
          3, 1, 2,  2,  1,  1, 3, 3, 3, 4,  4, 5, 5, 5,  5,  1, 1,
          3, 1, 2,  2,  1,  1, 3, 3, 3, 4,  4, 5, 5, 5,  4,  1, 1,
          1, 1, 2, 50,  1,  1, 3, 3, 3, 4,  4, 5, 5, 5, 50,  0, 1,
          1, 1, 2,  2,  1,  1, 0, 0, 0, 4,  4, 5, 5, 5,  3,  2, 0,
          1, 1, 2, 10, 20, 30, 0, 0, 0, 4,  4, 5, 5, 5, 11,  0, 0,
          1, 1, 2,  2,  1,  1, 3, 3, 3, 0,  0, 0, 5, 5,  0,  0, 0,
	],
	[ 0, 0, 0,  0,  0,  0, 0, 0, 0, 0,  0, 0, 0, 0,  0,  0, 0,
          0, 0, 0,  0,  0,  0, 0, 0, 0, 0,  0, 0, 0, 0,  0,  0, 0,
          0, 0, 0,  0, 50,  0, 0, 0, 0, 0,  0, 0, 0, 0,  0,  0, 2,
          0, 0, 0,  0,  0,  0, 0, 0, 0, 0,  0, 0, 0, 0,  0,  0, 2,
          0, 0, 0,  0,  0,  0, 0, 0, 0, 0,  0, 0, 0, 0,  0,  0, 0,
          0, 0, 1,  2,  3,  4, 0, 0, 0, 0,  0, 0, 0, 0,  0,  0, 1,
          0, 0, 0,  0,  0,  0, 0, 0, 0, 0,  0, 0, 0, 0,  0,  0, 0,
          0, 0, 0,  0,  0,  0, 0, 0, 0, 0,  0, 0, 0, 0,  0,  0, 1,
          0, 0, 0,  0,  0,  0, 0, 0, 0, 0,  0, 0, 0, 0,  0,  0, 0,
          0, 0, 0,  0,  0,  0, 0, 0, 0, 0,  0, 0, 0, 0,  0,  0, 1,
          0, 0, 0,  0,  0,  0, 0, 0, 0, 0,  0, 0, 0, 0,  0,  0, 0,
	]
	];
	game.init();
	game.initLevel();
} );

