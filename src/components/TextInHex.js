import * as PIXI from 'pixi.js-legacy'
import { PixiComponent } from '@inlet/react-pixi'
import {pixiSizeScalar} from '../utils'

export default PixiComponent('TextInHex', {
    create: props => {
        return new PIXI.Text('',{fontFamily : 'Arial', fontSize: pixiSizeScalar(24), align : 'center'});
    },
    applyProps: (instance, oldProps, newProps) => {
        const {fogged, fill, text, x, y, upper, lower} = newProps
        if (fogged) {
            instance.style.fill = '0xffffff'
        }
        else if (fill) {
            instance.style.fill = fill
        } else { 
            instance.style.fill = ['0x282828', '0xffe642']
        }

        instance.text = text
        let insHeight = y - instance.height / 2
        if (upper) {
            insHeight = insHeight - instance.height / 2
        }
        if (lower) {
            insHeight = insHeight + instance.height / 2
        }
        instance.position.set(x - instance.width / 2, insHeight)
        // instance.updateText()
    }

})