phina.globalize();
var FPS = 60;
var ROTATE_SPEED_MS = 100;
var ROTATE_SPEED_FRAME = Math.floor(FPS * ROTATE_SPEED_MS / 1000);
var ASSETS = {
	image: {
		slot_body: "./img/slot.png",
		slot_body_debug: "./img/slot_debug.png"
	}
};
var REEL_IN = -340;
var REEL_TOP =  -170;
var REEL_MIDDLE = 0;
var REEL_BOTTOM = 170;
var REEL_OUT = 340;
var ROTATING = 1;
var STOPPED = -1;
phina.define('MainScene',{
	superClass: 'CanvasScene',
	init: function(){
		this.superInit();
		var self = this;
		var lottery_screen = Lottery().addChildTo(self).setPosition(self.gridX.center(),self.gridY.center());
		var slot_body = Sprite('slot_body',640,960).addChildTo(this).setPosition(self.gridX.center(),self.gridY.center());
		var stat_screen = Stat().addChildTo(this).setPosition(self.gridX.center(), 100);
		var start_button = StartButton(lottery_screen).addChildTo(this).setPosition(self.gridX.center()+150,self.gridY.center()+220);
	}
});
phina.define('Lottery',{
	superClass: 'RectangleShape',
	init: function(){
		this.superInit({
			width: 500,
			height:350,
			fill: '#eee',
			stroke: 'transparent'
		});
		var reel1 = Reel().addChildTo(this).setPosition(-160,0);
		var reel2 = Reel().addChildTo(this).setPosition(0,0);
		var reel3 = Reel().addChildTo(this).setPosition(160,0);
		this.reels = [reel1,reel2,reel3];
	},
	start: function(){
		this.reels.each(function(reel){
			reel.isRotating = true;
		});
	}
});
phina.define('Stat',{
	superClass: 'RectangleShape',
	init: function(){
		this.superInit({
			width: 500,
			height:50,
			fill: '#eee'
		});
	}
});
phina.define('Reel',{
	superClass: 'RectangleShape',
	init: function(symbol_list){
		this.superInit({
			width:133,
			height:350,
			fill: 'transparent',
			stroke: 'transparent',
			text:"a"
		});
		//this.symbol_list = symbol_list.slice();
		this.symbols = [];
		this.initSymbols();
		this.isRotating = false;
		this.stop_symbol;
	},
	initSymbols: function(){
		var symbol2 = Symbol(null,REEL_TOP,1).addChildTo(this).setPosition(0,REEL_TOP);
		var symbol3 = Symbol(null,REEL_MIDDLE,1).addChildTo(this).setPosition(0,REEL_MIDDLE);
		var symbol4 = Symbol(null,REEL_BOTTOM,1).addChildTo(this).setPosition(0,REEL_BOTTOM);
		this.symbols.push(symbol4);
		this.symbols.push(symbol3);
		this.symbols.push(symbol2);
	},
	push: function(){
		var symbol = Symbol(null,REEL_IN,2).addChildTo(this).setPosition(0,REEL_IN);
		this.symbols.push(symbol);
	},
	stop:function(stop_symbol){
		this.stop_symbol = stop_symbol;
	},
	update: function(app){
		var self = this;
		if(this.isRotating){
			if(app.frame % ROTATE_SPEED_FRAME == 0){
				this.push();
				this.symbols.each(function(symbol){
					symbol.next(ROTATE_SPEED_MS,self);
				});
			}
		}
	}
});
phina.define('Symbol',{
	superClass: 'RectangleShape',
	init: function(color,reelY,value){
		if(!color){
			color = '#fff'
		}
		this.value = value;
		this.superInit({
			width: 133,
			height: 150,
			fill: color,
			stroke: '#aaa'
		});
		var label = Label({
			text:value,
			fill: 'Black',
			fontSize:40,
		}).addChildTo(this).setPosition(0,0);
		if(isNaN(reelY)){
			reelY = REEL_IN;
		}
		this.reelY = reelY;
	},
	next: function(speed,reel){
		var self = this;
		var vy = 0;
		switch(this.reelY){
		case REEL_IN:
			this.reelY = REEL_TOP;
			this.tweener.clear().to({y:this.reelY},speed);
			break;
		case REEL_TOP:
			this.reelY = REEL_MIDDLE;
			this.tweener.clear().to({y:this.reelY},speed);
			break;
		case REEL_MIDDLE:
			this.reelY = REEL_BOTTOM;
			this.tweener.clear().to({y:this.reelY},speed);
			break;
		case REEL_BOTTOM:
			this.reelY = REEL_OUT;
			this.tweener.clear().to({y:this.reelY},speed).call(function(){
				self.remove();
				reel.symbols.shift();
			});
			break;
		}
		
	}
});
phina.define('StartButton',{
	superClass: 'Button',
	init: function(lottery_screen){
		this.superInit({
			text: 'スタート'
		});
		this.lottery_screen = lottery_screen;
	},
	onpush: function(){
		this.lottery_screen.start();
	}
});
phina.main(function(){
	var app = GameApp({
		startLabel: 'main',
		assets: ASSETS
	});
	app.fps = FPS;
	document.body.appendChild(app.domElement);
	app.run();
});
