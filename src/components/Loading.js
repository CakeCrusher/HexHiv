import React from 'react'

import SingleHex from './SingleHex'
import {rgbParser, hexToRgb, rgbToHex, pixiSizeScalar} from '../utils'

const Loading = (props) => {
    let fillColor = '0x323232'
    let borderColor = '0x282828'
    if (props.color) {
        fillColor = '0x' + props.color.slice(1, props.color.length)
        const parsedColorRgb = rgbParser(hexToRgb(props.color))
        borderColor = rgbToHex(`rgb(${parsedColorRgb.r - 10},${parsedColorRgb.g - 10},${parsedColorRgb.b - 10})`)
    }
    return (
        <div className='loading-container'>
            <div style={{margin: '0 1rem', marginTop: '0.25rem'}}>{props.text}</div>
            <div>
                <div className='loading-spin' >
                    <SingleHex fillColor={fillColor} borderColor={borderColor} size={pixiSizeScalar(30)} />
                </div>
            </div>
        </div>
    )
}

export default Loading