import React from 'react'

import Hexagon from './Hexagon'
import TextInHex from './TextInHex'
import {coorEquals, fillColor, generateColor, colorShift, whoOwns, surroundingTiles} from '../utils'

const Map = (props) => {
    const {pos, size, session, myTempSocket, xray, onTileClick, randomColor, dragging, spectating} = props
    let mySocket = myTempSocket
    if (!session.players.find(p => p.id === mySocket)) {
        mySocket = session.players[0].id
    }
    let drawMap = []
    let myTileCoors = session.game.tiles.filter(t => whoOwns(t.ownership).length === 1 && whoOwns(t.ownership)[0] === mySocket)
    myTileCoors = myTileCoors.map(t => t.id)
    let unfoggedTiles = []
    for (const coor of myTileCoors) {
        const stArray = surroundingTiles(coor, session.game.tiles)
        stArray.forEach(t => {
            if (t && !unfoggedTiles.find(uft => coorEquals(uft, t.id))) {
                unfoggedTiles.push(t.id)
            }
        })
    }
    for (let y = 0; y < session.map.dimensions[1]; y++) {
        for (let x = 0; x < session.map.dimensions[0]; x++) {
            let foggedTile = false
            if (!spectating) {
                foggedTile = unfoggedTiles.find(uft => coorEquals(uft, [x,y])) ? false : true
            }
            // const foggedTile = false

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
            let investmentText = ''
            if (myInvestment > 0 || currentInvestment > 0) {
                investmentText = `${myInvestment}${currentInvestmentStr}`
            }
            // if user has xray special
            let xrayText = ''
            if (xray) {
                const thisTileLeads = thisTile.ownership.sort((a, b) => b.investment - a.investment)
                const tileLeader = thisTileLeads[0].id === mySocket ? thisTileLeads[1] : thisTileLeads[0]
                if (tileLeader.investment || myInvestment) {
                    xrayText = tileLeader.investment
                }
            }
            const xrayInfo = <TextInHex fogged={foggedTile} text={xrayText} x={hexX} y={hexY} upper={currentInvestmentStr || myInvestment} key={`Sx${x},${y}`} /> 

            const investmentInfo = <TextInHex fogged={foggedTile} fill={colorShift(color, 50)} text={investmentText} x={hexX} y={hexY} lower={(!foggedTile && xrayText) || xrayText === 0} key={`Sm${x},${y}`} />


            const gameSpecials = session.game.specials.filter(s => s.turn <= session.game.turn)
            const isSpecialTile = gameSpecials.find(s => coorEquals(s.coor, [x,y]) && s.usage > 0)
            if (isSpecialTile && !foggedTile) {
                drawMap.push(<Hexagon fogged={foggedTile} fill={color} borderColor="0xffe642" x={hexX} y={hexY} size={size} triggerOnClick={() => dragging ? null : onTileClick([x, y])} key={`${x},${y}`}/>)
                drawMap.push(<TextInHex fogged={foggedTile} text={`${isSpecialTile.type}${currentInvestmentStr}`} x={hexX} y={hexY} key={`S${x},${y}`} />)
            }
            // if the tile is active
            else if (session.map.grid[y * session.map.dimensions[1] + x]){
                drawMap.push(<Hexagon fogged={foggedTile} fill={color} x={hexX} y={hexY} size={size} triggerOnClick={() => dragging ? null : onTileClick([x, y])} key={`${x},${y}`}/>)
                if (!foggedTile) {
                    drawMap.push(xrayInfo)
                }
                drawMap.push(investmentInfo)

                // drawMap.push(
                //     <Text
                //         text="3"
                //         x={hexX - 10}
                //         y={hexY - 12}
                //         style={
                //             {
                //                 align: 'center',
                //                 fontFamily: 'Arial',
                //                 fontSize: 24,
                //                 fill: '#282828', // gradient
                //             }
                //         }
                //     />
                // )
                // drawMap.push(
                //     <Text
                //         text="7"
                //         x={hexX}
                //         y={hexY}
                //         style={
                //             {
                //                 align: 'center',
                //                 fontFamily: 'Arial',
                //                 fontSize: 24,
                //                 fill: '#282828', // gradient
                //             }
                //         }
                //     />
                // )
            } else {
                // drawMap.push(<Hexagon fill={color} x={hexX} y={hexY} size={size} triggerOnClick={() => dragging ? null : onTileClick([x, y])} startInvisible key={`${x},${y}`}/>)
                // drawMap.push(investmentInfo)
                // drawMap.push(xrayInfo)
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