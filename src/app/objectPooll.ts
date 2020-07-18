import * as Interactable from './interactable'
import * as Collision from './ collision';
import { systems } from 'pixi.js';

type GameObjectsType = Interactable.InteractableBase;


class GameObjectsPooll{

    private objectMap: Map<String,GameObjectsType>;
    private stage:PIXI.Container;

    //This represent who is colliding with who in the moment
    private collisionMap: Map<String,boolean>;

    constructor(){
        this.objectMap = new Map();
        this.collisionMap = new Map();
    }

    addObject(name:string,object:GameObjectsType){
        this.objectMap.set(name,object);
        this.stage.addChild(object.toStage());
    }

    removeObject(name:string){
        let obj = this.objectMap.get(name);
        this.stage.removeChild(obj.toStage());
        this.objectMap.delete(name);
    }

    getObject(name:string){
        return this.objectMap.get(name);
    }

    addStage(stage:PIXI.Container){
        this.stage = stage;
    }

    updateAll(delta:number){
        this.objectMap.forEach(element => {
            element.update(delta);
        });
    }
    
    //Also i think this should be located in another module



    //Yeah this is ugly. But its a game jam, c'mon. And performance wise it should't be that bad, consireing we only have a couple of game objects.
    updateCollision(){  
        this.objectMap.forEach(obj1 => {
            if(obj1.properties.hasHitBox){
                this.objectMap.forEach(obj2 => {
                    if(obj2.properties.hasHitBox){
                        if(obj1 != obj2){
                            
                            let key = obj1.name + obj2.name;
                            if(this.collisionMap.get(key)){
                                if(!Collision.Rectangle(obj1,obj2)){
                                    obj1.updateCollisionsHitsLeave(obj2);
                                    this.collisionMap.set(key,false);
                                }
                            }else{
                                if(Collision.Rectangle(obj1,obj2)){
                                    obj1.updateCollisionsHits(obj2);
                                    this.collisionMap.set(key,true);
                                }
                            }
                        }
                    }
                });
            }
        });
    }

}

export const ObjectPooll = new GameObjectsPooll();
