import * as PIXI from 'pixi.js-legacy'
import { PixiComponent } from '@inlet/react-pixi'
import {pixiSizeScalar} from '../utils'

export default PixiComponent('TextInHex', {
    create: props => {
        return new PIXI.Text('',{fontFamily : 'Arial', fontSize: pixiSizeScalar(24), align : 'center'});
    },
    applyProps: (instance, oldProps, newProps) => {
        const {fill, text, x, y} = newProps
        if (fill) {
            instance.style.fill = fill
        } else {
            instance.style.fill = '0x282828'
        }
        instance.text = text
        instance.position.set(x - instance.width / 2, y - instance.height / 2)
    }

})