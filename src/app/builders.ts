import * as Interactable from './interactable'
import { ObjectPooll as GameObjects} from './objectPooll';


var stage:PIXI.Container;

export function addStage(stageP:PIXI.Container){
    stage = stageP;
}


export function createGameObject_WPos(name:string,sprite : PIXI.AnimatedSprite | PIXI.Sprite | PIXI.Graphics,x:number,y: number,){
    let gameobj = new Interactable.InteractableBase(name,x,y,sprite);
    GameObjects.addObject(name,gameobj);
    return gameobj;
}

export function createGameObject(name:string,sprite : PIXI.AnimatedSprite | PIXI.Sprite | PIXI.Graphics){
    return createGameObject_WPos(name,sprite,0,0);
}