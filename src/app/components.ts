import {Interactable} from './interactable'
import {Component} from './interactable'


//Use this to trigger hits events
export class HitBoxComponent implements Component{
    name:string = "HitBox";
    constructor(){
    }
    //Implementation
    start(obj:Interactable):void{
        obj.properties.hasHitBox = true;
    }

    update():void{
    }

    onHit(){
    }

    onHitLeave(){};
}



export class BehaviorComponent implements Component{

    name:string = "Behavior";

    private updateBehavior:Function;
    private startBehavior:Function;
    private hitBehavior:Function;
    private hitLeaveBehavior:Function;



    constructor(){
        //Default is do nothing
        this.updateBehavior = (delta:number,obj:Interactable) => {};
        this.startBehavior = (obj:Interactable)=> {};
        this.hitBehavior = (thisObj:Interactable, otherObj:Interactable)=>{};
        this.hitLeaveBehavior = (thisObj:Interactable, otherObj:Interactable)=>{};
    }

    addStartBehavior(behavior:Function){
        this.startBehavior = behavior;
        return this;

    }

    addUpdateBehavior(behavior:Function){
        this.updateBehavior = behavior;
        return this;
    }

    addHitBehavior(behavior:Function){
        this.hitBehavior = behavior; 
        return this;
    }

    addHitLeaveBehavior(behavior:Function){
        this.hitLeaveBehavior = behavior; 
        return this;
    }

    

    //Implementation
    start(obj:Interactable):void{
        this.startBehavior.call(this,obj);
    }
    update(delta:number,obj:Interactable):void{
        this.updateBehavior.call(this,delta,obj);
    }

    onHit(thisObj:Interactable, otherObj:Interactable):void{
        this.hitBehavior.call(this,thisObj,otherObj);
    }

    onHitLeave(thisObj:Interactable, otherObj:Interactable):void{
        this.hitLeaveBehavior.call(this,thisObj,otherObj);
    }
}



