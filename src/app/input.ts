
class Input{	

	pressed:boolean = false;
	
    isPressed(){
        return this.pressed;
    }

    constructor(readonly key: string){
        window.addEventListener("keydown",this.keyDownListener.bind(this));
        window.addEventListener("keyup",this.keyUpListener.bind(this))
    }

    keyDownListener(e:KeyboardEvent){
        if(e.key == this.key){
            this.pressed = true;
            e.preventDefault();
        }
    }

    keyUpListener(e:KeyboardEvent){
        if(e.key == this.key){
            this.pressed = false;
            e.preventDefault();
        }
    }
}

var map = new Map<string,Input>();

export function input(key:string){
	let input = map.get(key);
	if(input){
		return input;
	}else{
		input = new Input(key);
		map.set(key,input);
		return input;
	}	
}

