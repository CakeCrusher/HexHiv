import * as PIXI from 'pixi.js-legacy'
import { PixiComponent } from '@inlet/react-pixi'

import {colorShift, pixiSizeScalar} from '../utils'

export default PixiComponent('Hexagon', {
    create: props => {
        return new PIXI.Graphics()
    },
    applyProps: (instance, oldProps, newProps) => {
        const pointy_hex_corner = (center, size, i) => {
            const angle_deg = 60 * i - 30
            const angle_rad = Math.PI / 180 * angle_deg
            return [
                center.x + size * Math.cos(angle_rad),
                center.y + size * Math.sin(angle_rad),
            ]
        }
        const hex_points = (center, size) => {
            let points = []
            for (let i = 0; i < 6; i++) {
                const point = pointy_hex_corner(center, size, i)
                points.push(point[0])
                points.push(point[1])
            }
            return points
        }
        const generateHexagon = (ins, x, y, size, color, providedBorderColor) => {
            let borderColor = '0xa8a8a8'
            if (providedBorderColor) {
                borderColor = providedBorderColor
            }
            else if (color !== '0xffffff') {
                borderColor = colorShift(color, 10)
            }
            ins.clear()
            ins.lineStyle(pixiSizeScalar(2), borderColor, 1)
            ins.beginFill(color)
            ins.drawPolygon(hex_points({x, y}, size))
            ins.endFill()
            return ins
        }
        const {fill, borderColor, x, y, size, triggerOnClick, draggedOver, dragging, draggedOverState, triggerOnDrag, startInvisible} = newProps
        generateHexagon(instance, x, y, size, fill, borderColor)
        if (startInvisible) {
            instance.visible = false
        }
        instance.interactive = true
        instance.buttonMode = true
        instance.hitArea = new PIXI.Polygon(hex_points({x, y}, size))
        instance.mouseover = () => {
            instance.alpha = 0.7
        }
        instance.mouseout = () => {
            instance.alpha = 1
        }

        if (triggerOnClick) {
            instance.click = () => {
                triggerOnClick()
            }
            instance.tap = () => {
                triggerOnClick()
            }
        }

        if (triggerOnDrag) {
            instance.pointerout = () => {
                if (draggedOverState) {
                    draggedOver(false)
                }
                instance.alpha = 1
            }
            if (dragging) {
                instance.pointerover = () => {
                    if (!draggedOverState) {
                        triggerOnDrag()
                        draggedOver(true)
                    }
                }
            } else {
                instance.pointerdown = () => {
                    if (!draggedOverState) {
                        triggerOnDrag()
                        draggedOver(true)
                    }
                }
            }
            instance.pointerup = () => {
                if (draggedOverState) {
                    draggedOver(false)
                }
            }
        }
    }

})