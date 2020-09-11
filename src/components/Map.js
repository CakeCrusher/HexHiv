import React from 'react'

import Hexagon from './Hexagon'
import TextInHex from './TextInHex'
import {coorEquals, fillColor, generateColor, colorShift, whoOwns} from '../utils'

const Map = (props) => {
    const {pos, size, session, mySocket, xray, onTileClick, randomColor, dragging} = props
    let drawMap = []
    for (let y = 0; y < session.map.dimensions[1]; y++) {
        for (let x = 0; x < session.map.dimensions[0]; x++) {
            let thisTile = session.game.tiles.find(t => coorEquals(t.id, [x, y]))
            let color = fillColor(thisTile.ownership, session.players)
            if (randomColor) {
                color = generateColor()
            }

            let hexX = Math.sqrt(3) * size * x + pos[0]
            let hexY = y * 0.75 * size * 2 + pos[1]
            if (y % 2 === 1) {
            hexX = hexX + Math.sqrt(3) * size / 2
            }

            // const addInvestmentInfo = color !== '0xffffff' ? <TextInHex fill={colorShift(color, 30)} text={thisTile.ownership.find(i => i.id === mySocket).investment} x={hexX} y={hexY} key={`S${x},${y}`} /> : null


            const myInvestment = thisTile.ownership.find(i => i.id === mySocket).investment
            const currentMoves = props.moves.filter(m => m.turn === session.game.turn)
            const currentInvestment = currentMoves.filter(m => coorEquals([x, y], m.coor)).length
            const currentInvestmentStr = currentInvestment > 0 ? '+' + currentInvestment : ''
            let addInvestmentInfo = myInvestment > 0 || currentInvestment > 0 ? <TextInHex fill={colorShift(color, 50)} text={`${myInvestment}${currentInvestmentStr}`} x={hexX} y={hexY} key={`S${x},${y}`} /> : null
            // if user has xray special
            let xrayInfo = ''
            if (xray) {
                const owner = whoOwns(thisTile.ownership)
                const highestInvestment = thisTile.ownership.find(o => o.id === owner[0]).investment
                xrayInfo = highestInvestment !== myInvestment ? `(${highestInvestment})` : ''
                addInvestmentInfo = highestInvestment ? <TextInHex fill={colorShift(color, 50)} text={`${myInvestment ? myInvestment : ''}${xrayInfo}${currentInvestmentStr}`} x={hexX} y={hexY} key={`S${x},${y}`} /> : null
            }



            const gameSpecials = session.game.specials.filter(s => s.turn <= session.game.turn)
            const isSpecialTile = gameSpecials.find(s => coorEquals(s.coor, [x,y]) && s.usage > 0)
            if (isSpecialTile) {
                drawMap.push(<Hexagon fill={color} borderColor="0xffe642" x={hexX} y={hexY} size={size} triggerOnClick={() => dragging ? null : onTileClick([x, y])} key={`${x},${y}`}/>)
                drawMap.push(<TextInHex text={`${isSpecialTile.type}${currentInvestmentStr}`} x={hexX} y={hexY} key={`S${x},${y}`} />)
            }
            else if (session.map.grid[y * session.map.dimensions[1] + x]){
                drawMap.push(<Hexagon fill={color} x={hexX} y={hexY} size={size} triggerOnClick={() => dragging ? null : onTileClick([x, y])} key={`${x},${y}`}/>)
                drawMap.push(addInvestmentInfo)
            } else {
                drawMap.push(<Hexagon fill={color} x={hexX} y={hexY} size={size} triggerOnClick={() => dragging ? null : onTileClick([x, y])} startInvisible key={`${x},${y}`}/>)
                drawMap.push(addInvestmentInfo)
            }
        }
    }
    return (
        <React.Fragment>
            {drawMap}
            {props.children}
        </React.Fragment>
    )
}

export default Map