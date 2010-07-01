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
	unSelect : function() {
		this.selected = false;
		//debug( "test remove element: "+this.game.cursor.attached_obj+" / "+this.selected );
	},
	select : function() {
		// Selection
		this.selected = true;
		if( this.attached_obj ) {
			if( this.game.cursor.attached_obj ) {
				this.game.delObj( this.game.cursor.attached_obj );
				this.game.cursor.attached_obj = null;
			}
			//debug( "attached obj"+c.obj_id );
			this.game.newCursorObj( this.attached_obj );
		}
	},
	clickInside : function( mouse ) {
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
			// In the board, update position
			this.attached_obj.update( new Point( this.x - this.game.origin.x + this.w/2, this.y - this.game.origin.y + this.h/2 ) );
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
	__constructor : function( game ) {
		this.w = 43;
		this.h = 151;
		this.__base( game, new Point( 315, 580 ), "gun_tube.png" );
		this.coin = null;
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
		var speed = 11;
		var decy = getAdjacent( angle, speed );
		var decx = getOppose( angle, speed );
		var v = new Point( decx, -decy );
		o.coin.v = v;
		//debug( "currentTime: "+$(snds['fire']).attr('currentTime') );
		//debug( "duration: "+$(snds['fire']).attr('duration') );
		//debug( "state: "+snds['fire'].ended );
		//$(snds['fire']).attr('loop',true);
		//snds['fire'].currentTime = 0.00001;
		if( snds['fire'].currentTime==0 || snds['fire'].currentTime==snds['fire'].duration ) {
			snds['fire'].play();
			//debug("fire ONE");
		} else {
			snds['fire2'].play();
			//debug("fire TWO");
		}
		
		o.newCoin();
	},
	newCoin: function() {
		var s = new Point( 315, 500 );
		var color = Math.floor( Math.random()*5 ) + 1;
		this.coin = new GunCoin( this.game, s, null, color );
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
		this.coin.update( ss );
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
		ctx.translate( this.x+this.game.origin.x, this.y+this.game.origin.y );
		ctx.rotate( this.angle );
		ctx.drawImage( this.img, -this.wh, -(this.h-40) );
		ctx.rotate( -this.angle );
		ctx.translate( -this.x-this.game.origin.x, -this.y-this.game.origin.y );
	},
	role : function(){
		return "gun";
	}
});



//
// Abstract class for all object belonging to the level
//
var LevelObj = $.inherit( Obj, {
	__constructor : function( game, p, img_name ){
		this.__base( game, p, img_name );
		this.state = null;
		this.destruction_step = 0;
		this.destruction_steps = 30;
		this.timeout_start = (new Date()).getTime();
		this.timeout = 0;
	},
	doAnim : function() {
		var today = new Date();
		if( this.state=="wait_destruction" ) {
			if( this.timeout<(today.getTime()-this.timeout_start) ) {
				this.state = "destruction";
			}
		}
		if( this.state=="destruction" ) {
				//debug( (today.getTime()-this.timeout_start) );
				this.destruction_step+=2;
				//debug( this.destruction_steps );
				if( this.destruction_step>this.destruction_steps )
					this.game.delObj( this );
		}
	},
	suicide : function( timeout ) {
		this.game.level[this.ind] = null;
		if( timeout>0 ) {
			this.timeout = timeout;
			this.timeout_start = (new Date()).getTime();
			this.state = "wait_destruction";
		} else {
			this.state = "destruction";
		}
	},
	addNewNeighbour : function( count, color ) {
		if( count>0 ) {
		   var c = this.getNeighbour();
		   for( i in c ) {
			  if( c[i] ) {
				 var lvl = this.game.getLevel();
				 if( lvl[c[i][0]]==null ) {
					/*
					// Alternative method to check if already added
					for( j in this.game.objs ) {
						if( this.game.objs[j].ind==c[i][0] )
							break;
					}
					if( this.game.objs[j].ind==c[i][0] )	// already exists
						continue;
					*/
					var p = this.game.getPosition( c[i][0] );
					var o = this.game.createObjFromType( color, 'pos', p ); //new Coin( game, p, null, color );
					if( this.game.addObj( o, true ) ) {
						//this.game.level[c[i][0]] = o;
						//this.game.debug( "add id:"+c[i][0]+ " x:"+Math.round(o.x)+" y:"+Math.round(o.y)+" c:"+count+" co:"+color );
						o.addNewNeighbour( count-1, color );
					}
				 }
			  }
		   }
		}
	},
	getNeighbour : function() {
		var lvl = this.game.getLevel();
		var c = [];
		var yind = Math.round( (this.y-this.game.coin_h/2)/(this.game.coin_h*0.5) );
		if( yind%2==1 ) coef = 0;
		else coef = 1;
		if( this.ind>this.game.x_coins+1 ) c.push( [this.ind-this.game.x_coins-1+coef, lvl[this.ind-this.game.x_coins-1+coef]] );
		if( this.ind>this.game.x_coins*2 ) c.push( [this.ind-this.game.x_coins*2, lvl[this.ind-this.game.x_coins*2]] );
		if( this.ind>this.game.x_coins && this.ind%18>0 ) c.push( [this.ind-this.game.x_coins+coef, lvl[this.ind-this.game.x_coins+coef]] );

		if( this.ind<this.game.max_coins+this.game.x_coins-1 ) c.push( [this.ind+this.game.x_coins-1+coef, lvl[this.ind+this.game.x_coins-1+coef]] );
		if( this.ind<this.game.max_coins+this.game.x_coins*2 ) c.push( [this.ind+this.game.x_coins*2, lvl[this.ind+this.game.x_coins*2]] );
		if( this.ind<this.game.max_coins+this.game.x_coins ) c.push( [this.ind+this.game.x_coins+coef, lvl[this.ind+this.game.x_coins+coef]] );
		/*
		for( i in c )
		    if( c[i] )
		        debug( "ind: "+this.ind+" neighbour:"+c[i][0] );
		*/
		return c;
	},
	explode : function() {
		this.game.delObj( this );
	},
	convert: function( color ) {
		var c = this.game.createObjFromType( color, 'id', this.ind );
		this.game.delObj( this );
		if( c ) this.game.addObj( c, true );
		return false;
	},
});




//
// Abstract class for animated object in level
//
var AnimatedObj = $.inherit( LevelObj, {
	__constructor : function( game, p, img_name, max_frame ){
		if( ! this.w )
			this.w = 25;
		if( ! this.h )
			this.h = 25;
		this.__base( game, p, img_name );
		this.frame = 0;
		this.max_frame = max_frame;
		this.lastt = new Date();
	},
	doAnim : function() {
		var frametime = ((new Date()).getTime()-this.lastt)/45;
		this.lastt = new Date();
		if( !(frametime>1 && frametime<80) )
			frametime = 0.1;
		
		this.frame += frametime;
		if( this.frame>this.max_frame )
			this.frame = 0;
	},
	render : function( ctx ) {
		ctx.drawImage( this.img,  Math.floor(this.frame)*this.w, 0, this.w, this.h, this.drawx, this.drawy, this.w, this.h );
	}
});


// Breakable stone
var Breakable = $.inherit( AnimatedObj, {
	__constructor : function( game, p ){
		this.__base( game, p, "breakable.png", 5 );
	},
	collide : function( color ) {
		this.game.delObj( this );
	}
});


// Unbreakable stone
var Unbreakable = $.inherit( AnimatedObj, {
	__constructor : function( game, p ){
		this.w = 25;
		this.h = 23;
		this.__base( game, p, "wall.png", 5 );
	},
	collide : function( color ) {
		this.addNewNeighbour( 3, color );
	},
	explode: function() {
		// Do not break :)
	}
});


var Eraser = $.inherit( LevelObj, {
	__constructor : function( game, p ){
		this.w = 22;
		this.h = 22;
		this.__base( game, p, "eraser.png", 0 );
	},
});


var Wall = $.inherit( LevelObj, {
	__constructor : function( game, p ){
		var img_name = "stone"+rand(1,5)+".png";
		this.w = 23;
		this.h = 23;
		this.__base( game, p, img_name, 0 );
	},
	collide : function( color ) {
		this.addNewNeighbour( 2, color );
	}
});


var Scatter = $.inherit( AnimatedObj, {
	__constructor : function( game, p ){
		this.w = 25;
		this.h = 23;
		this.__base( game, p, "white_stone.png", 5 );
	},
	collide: function( color ) {
		this.convert( color );
	},
	convert: function( color ) {
		var c = this.getNeighbour();
		this.__base( color );
		for( i in c ) {
			if( c[i] ) {
				var lvl = this.game.getLevel();
				if( lvl[c[i][0]]!=null && lvl[c[i][0]]!=this ) {
					//if( c[i][1] ) {
					//debug( "Convert existing element" );
					if( c[i][1] ) c[i][1].convert( color );
				} else {
					//debug( "Convert non-existing element: create new" );
					var o = this.game.createObjFromType( color, 'id', c[i][0] );
					if( o ) this.game.addObj( o, true );
				}
			}
		}
		return false;
	},
});


var Bomb = $.inherit( AnimatedObj, {
	__constructor : function( game, p ){
		this.w = 41;
		this.h = 34;
		this.__base( game, p, "bomb.png", 5 );
	},
	collide : function( color ) {
		this.game.delObj( this );
		var c = this.getNeighbour();
		for( i in c ) {
			if( c[i] && c[i][1] ) {
				c[i][1].explode();
			}
		}
		snds['xplosionbig'].play();
	}
});



var Gold = $.inherit( AnimatedObj, {
	__constructor : function( game, p ){
		this.w = 23;
		this.h = 23;
		this.__base( game, p, "coin.png", 28 );
	},
	collide : function( color ) {
		this.game.scoreUp( 500 );
		this.game.delObj( this );
	}
});



var Hime = $.inherit( LevelObj, {
	__constructor : function( game, p ){
		this.w = 57;
		this.h = 67;
		this.__base( game, p, "hime.png" );
		this.frame = 0;
		this.animation = 0;
		this.animation_freq = Math.floor(Math.random()*60)+30;
		this.max_frame = 11;
		this.role = "hime";
		this.state = "wait";
		this.fly_maxframe = 100;
		this.fly_frame = 0;
		
		// Bezier
		this.C1 = new Point( 70-this.game.origin.x, 220-this.game.origin.y );	// End point
		this.C4 = new Point( this.x, this.y );		// Hime point
		var d = this.C4.x-this.C1.x;			// Distance
		var dy = d/4;
		var vx = Math.round(Math.random()*(d/2));
		var v1 = (Math.round(Math.random()*1)==0?-1:1) * (Math.round(Math.random()*dy)+(dy/2));
		this.C2 = new Point( this.C1.x+vx, this.C1.y+v1 );	// Randomized curve point for End point
		this.C3 = new Point( this.C4.x-vx, this.C4.y-v1 );	// Randomized curve point for Hime point
	},
	collide : function( color ) {
                this.game.level[this.ind] = null;
		this.state = "fly";
		snds['free'].play();
	},
	rescued : function( ctx ) {
		var lvl = this.game.getLevel();
		var hime_count = 0;
		for( var id in lvl ) {
			if( lvl[id] && lvl[id].role=="hime" )
				hime_count++;
		}
		if( hime_count==0 ) {
			snds['win'].play();
			this.game.win();
		}
		this.game.delObj( this );
	},
	doAnim : function( ctx ) {
		var frametime = ((new Date()).getTime()-this.lastt)/80;
		this.lastt = new Date();
		if( !(frametime>0 && frametime<140) )
			frametime = 0.4;
		
		if( this.state=="wait" ) {
			this.animation++;
			if( this.animation>this.animation_freq ) {
				this.frame += frametime;
				if( this.frame>this.max_frame ) {
					this.frame = 0;
					this.animation = 0;
					this.animation_freq = Math.floor(Math.random()*60)+30;
				}
			}
		} else if( this.state=="fly" ) {
			//this.fly_frame +=0.4;
			this.fly_frame += frametime*4;
			//debug( "frame time: "+frametime+" fly_frame:"+this.fly_frame );
			if( this.fly_frame>this.fly_maxframe ) {
				this.rescued();
			} else {
			//for(var i=0; i<numPixels; i++) {				
				percent = (1/this.fly_maxframe) * this.fly_frame;
				var pos = getBezier(percent, this.C1, this.C2, this.C3, this.C4);
				//objPixels[i].moveTo(pos.x, pos.y);
				this.update( pos );
			}
		}
	},
	render : function( ctx ) {
		ctx.drawImage( this.img,  Math.floor(this.frame)*this.w, 0, this.w, this.h,  Math.floor(this.x-this.wh)+this.game.origin.x, Math.floor(this.y-this.hh)+this.game.origin.y, this.w, this.h );
		//ctx.drawImage( this.img, Math.floor(this.x-this.w/2), Math.floor(this.y-this.h/2) );
		ctx.fillStyle = "#000";
		ctx.font = 'arial 10px';
		//ctx.fillText( "x:"+this.x+" y:"+this.y+" frame:"+this.frame, Math.floor(this.x)+4, Math.floor(this.y) );
		if( debug_mode ) {
			this.game.circle( ctx, this.C2, 2 );
			this.game.circle( ctx, this.C3, 5 );
		}
	}
});



var CoinObj = $.inherit( LevelObj, {
	__constructor : function( game, p, v, color, role ){
		if( !( color>0 && color<6 ) )
			color = 1;
		this.w = 25;
		this.h = 23;
		this.__base( game, p, "el"+color+".png" );
		this.v = v;
		this.color = color;
		this.role = role;
		this.obj_id = 0;
	},
	doAnim : function(){
		this.__base();
		if( this.v!=null ) {
			this.x += (this.v.x); //*this.x;
			this.y += (this.v.y); //*this.y;
			if( this.y>600 ) {
				this.game.delObj( this );
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
			this.update( this );
			this.lastind = this.ind;
			// 2 position behind due to miscalculations
			this.ind = this.game.getIndex( new Point( this.x-this.v.x*2, this.y-this.v.y*2 ) );
			//this.ind = this.game.getIndex( new Point( this.x, this.y ) );
			this.checkCollisions();
			// Set real current index
			this.ind = this.game.getIndex( this );
			/*
			// Check one position ahead
			var p = new Point( this.x+this.v.x, this.y+this.v.y );
			this.ind = game.getIndex( p );
			var result = false;
			if( this.lastind!=this.ind )
				result = this.checkCollisions( game );
			// Check current position if no collision detected before
			if( !result ) {
				this.ind = game.getIndex( this );
				if( this.lastind!=this.ind )
					this.checkCollisions( game );
			}
			*/
		}
	},
	checkCollisions : function() {
		var ns = this.getNeighbour();
		var min = 99999;
		var min_e = null;
		// Browse the neighbours and get the minimum distance
		for( i in ns ) {
			if( ns[i] ) {
				var e = ns[i][1];
 				if( e ) {
					// Distance calculation with simple formula
					var dist = Math.abs(e.x-this.x) + Math.abs(e.y-this.y);
					if( dist<min ) {
						min = dist;		// Save the current minimum
						min_e = ns[i][1];	// Save this element
					}
					//debug( "dist: "+dist );
				}
			}
		}
		// If distance is inferior to a fixed number, we collide
		if( min<22 ) {
			this.game.delObj( this );
			min_e.collide( this.color );
			return true;
		}
		/*
		var lvl = this.game.getLevel();
		if( lvl[this.ind]!=null ) {
			this.game.delObj( this );
			lvl[this.ind].collide( this.color );
			return true;
		}
		*/
		return false;
	},
	collide : function( color ) {
		if( this.color==color ) {
			//this.game.debug( "this.destroyNeighbour ind:"+this.obj_id );
			this.destroyNeighbour( 0 );
		} else {
			//this.game.debug( "this.addNewNeighbour ind:"+this.ind );
			//lvl[this.ind].color = this.color;
			this.addNewNeighbour( 2, color );
		}
	},
	render : function( ctx ) {
		if( this.state=="destruction" ) {
			/*
			ctx.lineWidth = 1;
			ctx.lineCap = 'square';
			var locx = this.x+this.game.origin.x;
			var locy = this.y+this.game.origin.y;
			ctx.moveTo(locx-0.5, locy-0.5);
			ctx.lineTo(locx+0.5, locy-0.5);
			ctx.lineTo(locx+0.5, locy+0.5);
			ctx.lineTo(locx-0.5, locy+0.5);
			ctx.lineTo(locx-0.5, locy-0.5);
			*/
			var alphas = ['0.2','0.4','0.7','1'];
			for( i in alphas ) {
				ctx.beginPath();
				var alpha = alphas[i];
				var dec = this.destruction_step/(alphas.length-i+1);
				if( this.color==1 )
					ctx.strokeStyle = 'rgba(0,0,255,'+alpha+')';
				else if( this.color==2 )
					ctx.strokeStyle = 'rgba(0,255,0,'+alpha+')';
				else if( this.color==3 )
					ctx.strokeStyle = 'rgba(255,100,200,'+alpha+')';
				else if( this.color==4 )
					ctx.strokeStyle = 'rgba(255,0,0,'+alpha+')';
				else if( this.color==5 )
					ctx.strokeStyle = 'rgba(250,200,20,'+alpha+')';
				//debug( ctx.strokeStyle );
				ctx.moveTo(this.x+this.game.origin.x+dec, this.y+this.game.origin.y);
				ctx.arc(this.x+this.game.origin.x, this.y+this.game.origin.y, dec, 0, Math.PI*2, true);
				ctx.closePath();
				ctx.stroke();
			}
		} else {
			this.__base( ctx );
		}
	},
	destroyNeighbour : function( depth ) {
		var i = 0;
		var c = this.getNeighbour();
		var todo = new Array();
		//this.suicide( depth*100 );
		for( i in c ) {
			var lvl = this.game.getLevel();
			var elem = lvl[c[i][0]];
			if( c[i] && elem ) {
				if( elem.color==this.color ) {
					//elem.destroyNeighbour( depth+1 );
					var ne = this.game.createObjFromType( elem.type, 'id', elem.ind );
					todo.push( ne );
					//debug( "type:"+ne.type+" ind:"+ne.ind+" len:"+todo.length );
					elem.suicide( depth*100 );
				}
			}
		}
		for( i in todo ) {
			//debug( "destroyNeighbour(i): "+todo[i].ind );
			todo[i].destroyNeighbour( depth+1 );
		}
		this.game.scoreUp( 10 );
	},
	role : function(){
		return this.role;
	},
	/*
	render: function( ctx ){
		ctx.beginPath();
		ctx.lineWidth = 1;
		ctx.lineCap = 'square';
		ctx.strokeStyle = 'rgba(255,255,255,1)';
		var locx = this.x+this.game.origin.x;
		var locy = this.y+this.game.origin.y;
		ctx.moveTo(locx-0.5, locy-0.5);
		ctx.lineTo(locx+0.5, locy-0.5);
		ctx.lineTo(locx+0.5, locy+0.5);
		ctx.lineTo(locx-0.5, locy+0.5);
		ctx.lineTo(locx-0.5, locy-0.5);
		ctx.stroke();
	},
	*/
});


var Coin = $.inherit( CoinObj, {
	__constructor : function( game, p, v, color ){
		this.__base( game, p, v, color, "coin" );
	}
});


var GunCoin = $.inherit( CoinObj, {
	__constructor : function( game, p, v, color ) {
		this.__base( game, p, v, color, "guncoin" );
	},
});

function updateScoresRpc() {
	$.getJSON( "/himesama/scores", function(json) {
		game.updateScores( json );
		/*var scores = [];
		for( i in json ) {
			scores.push( json[i] )
		}*/
	});
}

var HSGame = $.inherit( LSGame, {
	__constructor : function( canvas, gamemode, level, x_coins, y_coins ){
	        // level=0, x_coins=17, y_coins=35
		this.__base( canvas );
		// Globals
		this.levels = {};
		this.gamemode = gamemode;
		this.coin_w = 25;
		this.coin_w_coef = 0.75;	// 75:OK
		this.coin_w_coef_ = 1.335;
		this.coin_h = 23;
		this.x_coins = x_coins; //Math.floor(580/(this.coin_w*1.25));
		this.y_coins = y_coins; //Math.floor(630/(this.coin_h));
		this.max_coins = this.y_coins * this.x_coins;
         	//this.debug( "y_coins: "+this.y_coins+" x_coins:"+this.x_coins );
		
		if( this.gamemode=="editor" ) {
			// Editor mode
			$("#hs_canvas").bind( "click_in_play", {game:this}, this.editClick );
			var types = [1,2,3,4,5, 10, 11, 20, 30, 40, 45, 50, 255];
			this.buttons_area = [ new Point( 20, 20 ), new Point( 140, 330 ) ];
			this.buttons = [];
			for( i in types ) {
				var b = new Button( this, types[i] );
				this.buttons.push( b );
				this.addObj( b );
			}
		} else {
			this.gun = new Gun( this );
			this.gun.img = this.preloadImage( this.gun.img_name );
			setInterval( updateScoresRpc, 50000 );
			updateScoresRpc();
		}
		this.current_level = parseInt( level );
		//debug( "Current level: "+this.current_level );
		this.score = 0;
		this.lives = 3;
		this.state = "init";
	},
	levelUp : function( pts ) {
		this.current_level++;
		var url = "/himesama/score/"+parseInt(this.score)+"/"+parseInt(this.current_level);
		$.getJSON( url, function(json) {
			if( game ) game.updateScores( json );
		});
	},
	scoreUp : function( pts ) {
		this.score += pts;
		var url = "/himesama/score/"+parseInt(this.score)+"/"+parseInt(this.current_level);
		//alert( url );
		$.getJSON( url, function(json) {
			if( game ) game.updateScores( json );
		});
	},
	updateScores : function( json ) {
		var table = "<table width='100%'><tr><th>user</th><th>score</th><th>level</th></tr>";
		$("#hs_scores_inner").html( table+"<tr>"+json.join( "</tr><tr>" )+"</tr></table>" );
	},
	drawBefore : function( ctx ) {
		if( this.gun )
			this.gun.doAnim();
		this.__base( ctx );
	},
	drawAfter : function( ctx ) {
		//debug( this.gun );
		if( this.gun )
			this.gun.render( ctx );
		if( debug_mode ) {
			var x;
			var d = this.coin_w_coef*this.coin_w;
			for( x=this.origin.x; x<800; x+=d ) {
				ctx.beginPath();
				ctx.strokeStyle = "#fff";
				ctx.moveTo(x, 10);
				ctx.lineTo(x, 630);
				ctx.stroke();
			}
			var d = this.coin_w / this.coin_w_coef_;
			for( x=this.origin.x; x<800; x+=d ) {
				ctx.strokeStyle = "#000";
				ctx.beginPath();
				ctx.moveTo(x, 10);
				ctx.lineTo(x, 630);
				ctx.stroke();
			}
		}
		/*
		*/
		this.__base( ctx );
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
		this.levelUp();
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
			c = new Coin( this, p, null, t );
		} else if( t==10 ) {
			c = new Breakable( this, p );
		} else if( t==11 ) {
			c = new Wall( this, p );
		} else if( t==20 ) {
			c = new Gold( this, p );
		} else if( t==30 ) {
			c = new Unbreakable( this, p );
		} else if( t==40 ) {
			c = new Bomb( this, p );
		} else if( t==45 ) {
			c = new Scatter( this, p );
		} else if( t==50 ) {
			c = new Hime( this, p );
		} else if( t==255 ) {
			// Special editor 'eraser' tool
			c = new Eraser( this, p );
		}
		if( c )
			c.type = t;
		return c;
	},
	loadLevel : function() {
		var level = this.current_level;
		$.getJSON( "/himesama/level/"+level+"/load", function (json) {
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
	
	addObj : function( obj, update_level ) {
		if( obj.role=="coin" && obj.ind>this.max_coins-this.x_coins*2 ) {
			// If too low, loose
			this.loose();
			return false;
		}
		// Set the level index of this object here
		obj.ind = this.getIndex( obj );
		if( obj.ind>=0 && update_level ) {
			if( this.level[obj.ind] ) {
				delete obj;
				return null;
			}
			this.level[obj.ind] = obj;
		}
		return this.__base( obj );
	},
	delObj : function( obj ) {
		//if( typeof update_level=="undefined" ) update_level = true;
		if( obj && this.level[obj.ind]==obj ) {
			// Remove the object from the level
			this.level[obj.ind] = null;
		}
		this.__base( obj );
	},
	
	getIndex : function( o ) {
		// Return level index from Point
		p = new Point( o.x, o.y );
		p.x -= Math.round(this.coin_w/2);
		p.y -= Math.round(this.coin_h/2);
		var yind = Math.round( p.y/(this.coin_h*0.5) );
		if( yind%2==1 ) coef = 0;
		else coef = 1;
		//var xind = Math.round( (p.x-coef*(this.coin_w*0.65))/(this.coin_w*1.5) );
		var xind = Math.round( (p.x-coef*(this.coin_w*this.coin_w_coef))/(this.coin_w*1.5) );
		var id = yind*this.x_coins + xind;
		/*
		*/
		// Calculations based on X index
		/*
		var c = this.coin_w_coef;
		var bxind = Math.round( (p.x*this.coin_w_coef_)/this.coin_w );
		if( bxind%2==1 ) {
			var yind = Math.round( (p.y) / (this.coin_h) )*2;
			//var yind = Math.round( (p.y*2) / (this.coin_h) );
			var xind = Math.round( (p.x*c-(this.coin_w*c)) / this.coin_w );
		} else {
			var yind = Math.round( (((p.y-(this.coin_h*0.5)))) / (this.coin_h) )*2;
			//var yind = Math.round( (((p.y)-(this.coin_h*0.5))) / (this.coin_h) )*2;
			//var yind = Math.round( (((p.y*2)-(this.coin_h*0.5))) / (this.coin_h) );
			var xind = Math.round( (p.x*c) / this.coin_w ) + this.x_coins;
		}
			var id = yind*this.x_coins + xind;
		debug( ["x:"+p.x+" y:"+p.y, "xind:"+xind+" yind:"+yind, "bxind:"+bxind+":"+bxind%2, id], true );
		*/
		//this.debug( "x:"+Math.floor(p.x)+"y:"+Math.floor(p.y)+" xi:"+xind+"yi:"+yind+"co:"+coef+" id:"+id );
		return id;
	},
	getPosition : function( id ) {
		// Return Point from level index
		var yind = Math.floor( id/this.x_coins ) * this.x_coins;
		var y = Math.floor( id/this.x_coins ) * (this.coin_h*0.5);
		if( Math.floor( id/this.x_coins )%2==1 ) coef = 0;
		else coef = 1;
		//var x = (id-yind)*(this.coin_w*1.5)+coef*(this.coin_w*0.75);
		var x = (id-yind)*(this.coin_w*1.5)+coef*(this.coin_w*this.coin_w_coef);
		//this.debug( "t:"+t+"x: "+x+"y: "+y+"yi:"+yind+"id:"+id );
		//x += Math.round( this.coin_w/3 );
		x += Math.round( this.coin_w/2 );
		y += Math.round( this.coin_h/2 );
		return new Point( x, y );
	},

	editClick: function( e ) {
		var g = e.data.game;
		if( g.mouse.x<g.buttons_area[1].x && g.mouse.y<g.buttons_area[1].y ) {
			// Left section
			for( i in g.buttons ) {
				if( g.buttons[i].clickInside( g.mouse ) ) {
					for( j in g.buttons ) {
						if( i!=j ) g.buttons[j].unSelect();
					}
					g.buttons[i].select();
					break;
				}
			}
		} else {
			// In the board
			if( g.cursor.attached_obj!=null ) {
				if( g.cursor.attached_obj.type==255 ) {
					// If eraser tool
					var ind = g.cursor.attached_obj.ind;
					g.delObj( g.level[ind] );
					delete g.level[ind];
					g.level[ind] = null;
				} else {
					//alert( game.cursor.attached_obj.img_name );
					g.level[g.cursor.attached_obj.ind] = g.cursor.attached_obj;
					//g.cursor.attached_obj = null;
					g.newCursorObj( g.cursor.attached_obj );
				}
			}
		}
		return false;
	},
	newCursorObj: function( obj ) {
		//var color = Math.floor( Math.random()*5 ) + 1;
		var p = new Point( this.cursor.x, this.cursor.y );
		//var c = this.game.createObjFromType( color, 'pos', p );
		var c = this.createObjFromType( obj.type, 'pos', p );
		c.doAnim = function() {
			//this.ind = game.getIndex( this );
			var p = game.getPosition( this.ind );
			this.update( p );
		}
		this.cursor.attached_obj = c;
		this.addObj( this.cursor.attached_obj );
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
	$.getJSON( "/himesama/level/"+game.current_level+"/save", data, function (json) {
		alert( json['result'] );
	} );
}
