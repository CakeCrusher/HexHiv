import React from 'react'
import { Stage } from '@inlet/react-pixi'
import Hexagon from './Hexagon'

const SingleHex = (props) => {
    const stageProps = {
        width: Math.sqrt(3) * props.size + 7,
        height: props.size * 2 + 6,
        options: {
          transparent: true,
          antialias: true
        },
        renderOnComponentChange: false
    }
    return (
        <Stage width={props.size} height={props.size} {...stageProps}>
            <Hexagon fill={props.fillColor} borderColor={props.borderColor} x={props.size} y={props.size + 3} size={props.size} triggerOnClick={() => {}}/>
        </Stage>
    )
}

export default SingleHex