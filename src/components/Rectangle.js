import * as PIXI from 'pixi.js-legacy'
import { PixiComponent } from '@inlet/react-pixi'
import {pixiSizeScalar, colorShift} from '../utils'

export default PixiComponent('Rectangle', {
  create: props => {
    return new PIXI.Graphics()
  },
  applyProps: (instance, oldProps, newProps) => {
    const { fill, x, y, width, height, doOnClick } = newProps
    instance.buttonMode = true
    instance.clear()
    instance.beginFill(fill)
    if (doOnClick) {
      let borderColor = colorShift(fill, 10)
      instance.lineStyle(pixiSizeScalar(5), borderColor, 1)
    }
    instance.drawRect(x, y, width, height)
    instance.endFill()
    instance.hitArea = new PIXI.Rectangle(x, y, width, height)
    instance.interactive = true
    if (doOnClick) {
      instance.mouseover = () => {
        instance.alpha = 0.7
      }
      instance.mouseout = () => {
        instance.alpha = 1
      }
      instance.click = () => {
        doOnClick()

      }
      instance.tap = () => {
        doOnClick()
      }
    }
  },
})