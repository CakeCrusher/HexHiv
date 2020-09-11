import * as PIXI from 'pixi.js-legacy'
import {PixiComponent} from '@inlet/react-pixi'

export default PixiComponent('SubmitBtn', {
    create: props => {
        return new PIXI.Graphics()
    },
    applyProps: (instance, oldProps, newProps) => {
        const {x, y, onPress} = newProps
        instance.beginFill(0xff0000)
        instance.lineStyle(4, 0xffffff, 0.5)
        instance.drawRect(x, y, 47, 47)
        instance.endFill()
        instance.interactive = true
        instance.hitArea = new PIXI.Rectangle(x, y, 47, 47)
        instance.click = () => onPress()
    }
})