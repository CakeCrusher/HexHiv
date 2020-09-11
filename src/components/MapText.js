import * as PIXI from 'pixi.js-legacy'
import { PixiComponent } from '@inlet/react-pixi'

import {isDark} from '../utils'

export default PixiComponent('MapText', {
    create: props => {
        return new PIXI.Text('',{fontFamily : 'Arial', align : 'center'});
    },
    applyProps: (instance, oldProps, newProps) => {
        const {text, x, y, bgColor, fill, fontSize, hoverOpacity, evenSmaller} = newProps
        let textColor = isDark(bgColor) ? '0xffffff' : '0x282828' 
        if (fill) {
            textColor = fill
        }
        if (hoverOpacity) {
            instance.interactive = true
            instance.alpha = 0.5
            instance.mouseout = () => {
                instance.alpha = 0.5
            }
            instance.mouseover = () => {
                instance.alpha = 1
            }
        }
        if (evenSmaller && window.innerWidth < 700) {
            instance.style.fontSize = fontSize - 2
        } else {
            instance.style.fontSize = fontSize
        }
        instance.style.fontWeight = 'bold'
        
        instance.style.fill = textColor
        instance.text = text
        instance.position.set(x, y)
    }

})