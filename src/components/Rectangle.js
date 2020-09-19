import * as PIXI from 'pixi.js-legacy'
import { PixiComponent } from '@inlet/react-pixi'

export default PixiComponent('Rectangle', {
  create: props => {
    return new PIXI.Graphics()
  },
  applyProps: (instance, oldProps, newProps) => {
    const { fill, x, y, width, height, doOnClick } = newProps
    instance.buttonMode = true
    instance.clear()
    instance.beginFill(fill)
    instance.drawRect(x, y, width, height)
    instance.endFill()
    instance.hitArea = new PIXI.Rectangle(x, y, width, height)
    instance.interactive = true
    if (doOnClick) {
      instance.click = () => {
        doOnClick()
      }
      instance.tap = () => {
        doOnClick()
      }
    }
  },
})