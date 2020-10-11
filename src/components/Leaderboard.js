import React from 'react'
import {Container} from '@inlet/react-pixi'

import MapText from './MapText'
import {rgbToHex, isDark, leaderboard, pixiSizeScalar} from '../utils'

const Leaderboard = (props) => {
    const rankings = []
    const players = leaderboard(props.session.players, props.session.game.tiles)
    players.forEach((p, ind) => {
        const strokeFill =  isDark(p.color) ? '0xffffff' : '0x282828'
        rankings.push(<MapText text={`${ind + 1}.) [${p.points} pts] ${p.username}`} x={0} y={ind * pixiSizeScalar(30)} fill={rgbToHex(p.color)} strokeFill={strokeFill} bgColor='rgb(0,0,0)' fontSize={pixiSizeScalar(18)} key={p.id} />)
    })
    return (
        <Container visible={props.visible} interactiveChildren={true} position={props.position} >
            {rankings}
        </Container>
    )
}

export default Leaderboard