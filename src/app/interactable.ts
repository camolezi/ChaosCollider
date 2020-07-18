import * as PIXI from 'pixi.js';
//import * as component from './components';

export interface Interactable {

    name:string;

    vx: number;
    vy: number;
    x: number;
    y: number;

    scaleX:number;
    scaleY:number;
    getWidth():number;
    getHeight():number;
    properties:any;

    tag:string;
}

export interface Component{
    name:string;
    start(obj:Interactable):void;
    update(delta:number,thisObj:Interactable):void;
    
    onHit(thisObj:Interactable, otherObj:Interactable):void;
    onHitLeave(thisObj:Interactable, otherObj:Interactable):void;
}


export class InteractableBase implements Interactable{

    static currentObjectsId:number = 0;

    properties:any = {};

    vx: number =0;
    vy: number =0;
    id: number;

    scaleX: number = 1;
    scaleY: number = 1;

    components: Array<Component>;

    tag:string;

    constructor(public readonly name:string,public x:number, public y: number,private sprite : PIXI.AnimatedSprite | PIXI.Sprite | PIXI.Graphics){
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.id = InteractableBase.currentObjectsId;
        InteractableBase.currentObjectsId++;
        this.components = new Array<Component>();
        this.tag = "GameObject";
    }

    setTag(tag:string){
        this.tag = tag; 
        return this;
    }

    toStage(){
        return this.sprite;
    }

    getHeight(){
        return this.sprite.height;
    }

    getWidth(){
        return this.sprite.width;
    }

    getHashKey(){
        return this.name;
    }

    addComponent(comp:Component){
        this.components.push(comp);
        comp.start(this);
        return this;
    }

    static wordX: number;
    static wordY: number;

    update(delta:number){
        if(this.components){
            this.components.forEach(element => {
                element.update(delta,this);
            });
        }

        //these are hacks to insure that the player dont leave the arena, yeah, this is a hack fix because we are out of time. This should be in the game objects behaviors
        if(this.tag != "Wall"){
            if(this.vx > 20){
                this.vx = 20;
            }
            if(this.vy > 20){
                this.vy = 20;
            }
            if(this.vx < -20){
                this.vx = -20;
            }
            if(this.vy < -20){
                this.vy = -20;
            }
    
            if(this.x > InteractableBase.wordX){
                this.x = InteractableBase.wordX;
            }
    
            if(this.x < 0){
                this.x = 0;
            }
    
            if(this.y > InteractableBase.wordY){
                this.y = InteractableBase.wordY;
            }
    
            if(this.y < 0){
                this.y = 0;
            }    
        }
    

        this.x += this.vx * delta;
        this.y += this.vy * delta;
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.sprite.scale.x = this.scaleX;
        this.sprite.scale.y = this.scaleY;
    }

    updateCollisionsHits(other:Interactable){
        if(this.components){
            this.components.forEach(element => {
                element.onHit(this,other);
            });
        }
    }
    updateCollisionsHitsLeave(other:Interactable){
        if(this.components){
            this.components.forEach(element => {
                element.onHitLeave(this,other);
            });
        }
    }


}
