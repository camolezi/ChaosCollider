import {Interactable} from './interactable'
import {Component} from './interactable'

//box collision
export function Rectangle(rect1:Interactable, rect2:Interactable) {
    if (rect1.x < rect2.x + rect2.getWidth() &&
        rect1.x + rect1.getWidth() > rect2.x &&
        rect1.y < rect2.y + rect2.getHeight() &&
        rect1.y + rect1.getHeight() > rect2.y) {
        return true;
    }
    return false;
}