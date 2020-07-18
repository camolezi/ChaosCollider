import * as PIXI from 'pixi.js';
import SOUND from "pixi-sound";

//Needed for typescript, i think
//Dont know about this, but it is working i guess
PIXI["sound"] = SOUND;


import {InteractableBase as Interactable, InteractableBase} from './interactable'
import { ObjectPooll as GameObjects} from './objectPooll';
import * as build from './builders';
import * as Components from './components';
import {input} from './input';
import * as Loader from '../assets/loader';

//Kudos for the boilerplate setup
//https://github.com/llorenspujol/parcel-pixijs-quickstarter


export class GameApp {

    private app: PIXI.Application;


    constructor(parent: HTMLElement, private width: number, private height: number) {

        this.app = new PIXI.Application({width, height, backgroundColor : 0x000000,forceCanvas:true});
        parent.replaceChild(this.app.view, parent.lastElementChild); // Hack for parcel HMR

        //Add stege to object Manager
        GameObjects.addStage(this.app.stage);
        // init Pixi loader
        let loader = new PIXI.Loader();

        loader.add("mainMusic", Loader.mainMusic);
        loader.add("hitSoundWall", Loader.hitSoundWall);
        loader.add("hitSoundEnemy",Loader.hitSoundEnemy);
        loader.add("hitSoundHolder",Loader.hitSoundHolder);
        loader.add("scoreSound",Loader.scoreSound);
    
        //Call when finish loading
        loader.load(this.onAssetsLoaded.bind(this));
    }



    private onAssetsLoaded() {
        
        let screenWidht = this.width;
        let screenHeight = this.height;

        InteractableBase.wordX = screenWidht;
        InteractableBase.wordY = screenHeight;


        this.createBorder();

        //This can be reutilized in other objects
        let collisionBehavior =(obj:Interactable,otherObj:Interactable)=>{
            if(obj.properties.colideWith.includes(otherObj.tag)){

                if(otherObj.tag == "Holder"){
                    if(obj.tag == "Enemy")
                    PIXI.sound.play("hitSoundEnemy");
                    else
                    PIXI.sound.play("hitSoundHolder");
                }
                if(otherObj.tag == "Enemy"){
                    PIXI.sound.play("hitSoundEnemy");
                }

                if(Math.abs(otherObj.vx) < Math.abs(obj.vx)){
                    otherObj.vx = 0.9*obj.vx;
                    obj.vx = -0.25*otherObj.vx;
                }else{
                    obj.vx = 0.9*otherObj.vx;
                    otherObj.vx = -0.25*obj.vx;
                }
                if(Math.abs(otherObj.vy) < Math.abs(obj.vy)){
                    otherObj.vy = 0.9*obj.vy;
                    obj.vy = -0.25*otherObj.vy;
                }else{
                    obj.vy = 0.9*otherObj.vy;
                    otherObj.vy = -0.25*obj.vy;
                }
            }
        }

        this.createPlayer(collisionBehavior);
        this.createNewEnemy(collisionBehavior,"Enemy0");
        this.createObjective(collisionBehavior);

        this.createPushBox();


        //Text, did not have the time to create a proper system, so UI will be  game objects ~~. thats okay a guess. 

        //Create score UI.
        let style = new PIXI.TextStyle({
            fontFamily: "Courier New",
            fontSize: 36,
            fill: "#white",
            stroke: '#BD0F63',
            strokeThickness: 5,
            dropShadow: true,
            dropShadowColor: "#472446",
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
        });
        let messageScore = new  PIXI.Text("Score: 0  -  Use the blue box to guide the yellow box into the green objective",style);
        build.createGameObject_WPos("Score",messageScore,40,30);

        //Start music
        let mainMusic = PIXI.sound.find("mainMusic");
        mainMusic.loop = true;
        mainMusic.volume = 0.5;
        mainMusic.play();        

        this.app.ticker.add(this.gameLoop.bind(this));

    }

    
    private gameLoop(delta: number){
        GameObjects.updateAll(delta);
        GameObjects.updateCollision();
    }

    //Placeholder graphics- this ended up being the final game graphics :/
    private createPlaceHolderSprite(color:number = 0xFF3300,size:number){
        let rectangleSprite = new PIXI.Graphics();
        rectangleSprite.lineStyle(2, 0xFFFFFF, 1);
        rectangleSprite.beginFill(color);
        rectangleSprite.drawRect(0, 0, size, size);
        rectangleSprite.endFill();
        //rectangleSprite.pivot.set(rectangleSprite.x + (rectangleSprite.width/2),rectangleSprite.y + (rectangleSprite.height/2))
        return rectangleSprite;
    }

    private createNewEnemy(hitBehavior:Function,name:string){
        let screenWidht = this.width;
        let screenHeight = this.height;
        let spriteSize = screenWidht/33;

        build.createGameObject_WPos(name,this.createPlaceHolderSprite(0x9e0d0d,spriteSize),screenWidht-150,screenHeight-150)
        .setTag("Enemy")
        .addComponent(new Components.HitBoxComponent())
        .addComponent(new Components.BehaviorComponent()
            .addHitBehavior(hitBehavior)
            .addStartBehavior(
                (obj:Interactable) => { 
                    obj.scaleX = 0.5;
                    obj.scaleY = 0.5;
                    obj.properties.colideWith = ["Holder"];
                }
            )
            .addUpdateBehavior(
                (delta:number,obj:Interactable) => {
                    let objective = GameObjects.getObject("Holder");
                    let vecX = objective.x - obj.x;
                    let vecY = objective.y - obj.y;
                    obj.vx += 0.0001*vecX;
                    obj.vy += 0.0001*vecY;
                }
            )    
        );


    }

    private createPlayer(playerHitBehavior:Function){

        let screenWidht = this.width;
        let screenHeight = this.height;
        let spriteSize = screenWidht/33;


        let recObj = build.createGameObject("Player",this.createPlaceHolderSprite(0x0341fc,spriteSize)).setTag("Player");
        let myComponent = new Components.BehaviorComponent();
        myComponent.addStartBehavior( (obj:Interactable) => { 
            obj.properties.inputD = input("d");
            obj.properties.inputA = input("a");
            obj.properties.inputS = input("s");
            obj.properties.inputW = input("w");
            obj.x = 50;
            obj.y = 50;
            obj.vx = 0.2; 
            obj.vy = 0.2;  
            //Colide with, use tag
            obj.properties.colideWith = ["Holder", "Enemy"];
        });


        myComponent.addUpdateBehavior((delta:number,obj:Interactable) => {
            if(obj.properties.inputD.isPressed()){
                obj.vx += (0.1*Math.abs(obj.vx) + 0.05);
            }
            if(obj.properties.inputA.isPressed()){
                obj.vx -= (0.1*Math.abs(obj.vx) + 0.05);
            }
            if(obj.properties.inputW.isPressed()){
                obj.vy -= (0.1*Math.abs(obj.vy) + 0.05);
            }
            if(obj.properties.inputS.isPressed()){
                obj.vy += (0.1*Math.abs(obj.vy) + 0.05);
            }
        });


        myComponent.addHitBehavior(playerHitBehavior);
        recObj.addComponent(myComponent);
        recObj.addComponent(new Components.HitBoxComponent());
    }

    private createObjective(EnemyhitBehavior:Function){

        let screenWidht = this.width;
        let screenHeight = this.height;
        let spriteSize = screenWidht/33;
        //Create objectives
        build.createGameObject_WPos("Objective",this.createPlaceHolderSprite(0x09d609,spriteSize),screenWidht/2,screenHeight/2)
        .setTag("Objective")
        .addComponent(new Components.HitBoxComponent())
        .addComponent(new Components.BehaviorComponent()
            .addHitBehavior(
            (obj:Interactable,otherObj:Interactable)=>{
                //Yeah, objective acomplished
                if(otherObj.tag == "Holder"){
                    //Play sound
                    PIXI.sound.play("scoreSound");

                    PIXI.sound.find("mainMusic").speed += 0.013;
                    
                    //New random place
                    obj.x =  Math.floor((Math.random() * screenWidht*0.86) + 1); 
                    obj.y =  Math.floor((Math.random() * screenHeight*0.86) + 1); 

                    //+1 in score
                    obj.properties.totalScore++; //Kind off a hack right now :(. Score arguably should not be a game object
                    GameObjects.getObject("Score").toStage().text = "Score: " + obj.properties.totalScore;

                    //at every +2 creates a new enemy
                    //spawning is not inefficient but only 30 min left
                    if(obj.properties.totalScore != 0 && obj.properties.totalScore % 2 == 0){
                        this.createNewEnemy(EnemyhitBehavior,"Enemy" + obj.properties.totalScore);
                    }
                }
            })
            .addStartBehavior(
                (obj:Interactable) => { 
                    obj.scaleX = 0.5;
                    obj.scaleY = 0.5;
                    obj.properties.totalTime = 0;
                    obj.properties.scaleVelocity = 0.04;
                    obj.properties.totalScore = 0;
                }
            )
            .addUpdateBehavior(
                (delta:number,obj:Interactable) => {
                    obj.properties.totalTime+= delta;
                    obj.scaleX = obj.scaleY = 0.25 + ( Math.abs(Math.sin(obj.properties.totalTime * obj.properties.scaleVelocity))/3) ;
                }
            )
        );

    }

    private createPushBox(){

        let screenWidht = this.width;
        let screenHeight = this.height;
        let spriteSize = screenWidht/33;

        build.createGameObject_WPos("Holder",this.createPlaceHolderSprite(0xf09f0a,spriteSize),screenWidht/2 - screenWidht/4,screenHeight/2).setTag("Holder")
        .addComponent(new Components.HitBoxComponent());
    }


    //Crate the map borders
    private createBorder(){
        let screenWidht =  this.app.renderer.width;
        let screenHeight  = this.app.renderer.height;

        let collisionWall = new Components.BehaviorComponent().addHitBehavior(
            (obj:Interactable,otherObj:Interactable)=>{
                if(obj.name == "wallLeft" || obj.name == "wallRight"){
                    otherObj.vx = -0.6* otherObj.vx;
                    otherObj.vy = 0.6* otherObj.vy;
                }else{
                    otherObj.vx = 0.6* otherObj.vx;
                    otherObj.vy = -0.6* otherObj.vy;
                }
                if(otherObj.tag =="Enemy")
                    PIXI.sound.play("hitSoundEnemy");
                else
                    PIXI.sound.play("hitSoundWall");
            }
        );
        
        let fieldSprite = new PIXI.Graphics();
        fieldSprite.lineStyle(5, 0x260415, 1);
        fieldSprite.beginFill(0xbd0f63);
        fieldSprite.drawRect(0, 0, screenWidht , 50);
        fieldSprite.endFill();
                //Field Creation
        build.createGameObject_WPos("wallSup",fieldSprite,0,0-30).setTag("Wall")
        .addComponent(new Components.HitBoxComponent())
        .addComponent(collisionWall);

        fieldSprite = new PIXI.Graphics();
        fieldSprite.lineStyle(5, 0x260415, 1);
        fieldSprite.beginFill(0xbd0f63);
        fieldSprite.drawRect(0, 0, screenWidht, 50);
        fieldSprite.endFill();
                //Field Creation
        build.createGameObject_WPos("wallInf",fieldSprite,0,screenHeight - 20).setTag("Wall")
        .addComponent(new Components.HitBoxComponent())
        .addComponent(collisionWall);

        fieldSprite = new PIXI.Graphics();
        fieldSprite.lineStyle(5, 0x260415, 1);
        fieldSprite.beginFill(0xbd0f63);
        fieldSprite.drawRect(0, 0,50,screenHeight);
        fieldSprite.endFill();
                //Field Creation
        build.createGameObject_WPos("wallLeft",fieldSprite,0-30,0).setTag("Wall")
        .addComponent(new Components.HitBoxComponent())
        .addComponent(collisionWall);


        fieldSprite = new PIXI.Graphics();
        fieldSprite.lineStyle(5, 0x260415, 1);
        fieldSprite.beginFill(0xbd0f63);
        fieldSprite.drawRect(0, 0,50, screenHeight);
        fieldSprite.endFill();
                //Field Creation
        build.createGameObject_WPos("wallRight",fieldSprite,screenWidht-20,0).setTag("Wall")
        .addComponent(new Components.HitBoxComponent())
        .addComponent(collisionWall);
    }
}
