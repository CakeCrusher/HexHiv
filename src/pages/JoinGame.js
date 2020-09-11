import React, {useState} from 'react'
import {Stage} from '@inlet/react-pixi'

import {socket} from '../App'
import {Map, useField, adjacentToAlly, coorEquals} from '../utils'
import Leaderboard from '../components/Leaderboard'

const JoinGame = () => {
    const [session, setSession] = useState(null)
    const gameId = useField('text')
    const color = useField('color')

    const [moves, setMoves] = useState([])
    const [turnDone, setTurnDone] = useState(false)
    const [sessionDone, setSessionDone] = useState(false)

    const thisPlayer = session ? session.players.find(p => p.id === socket.id) : null
    //socket.on events set
    socket.on('recieveSession', (data) => {
        setSession(data)
    })
    socket.on('turnDone', (data) => {
        setSession(data)
        setTurnDone(false)
    })
    // when game is over
    if (session && session.game && !sessionDone && session.turns < session.game.turn) {
        setSessionDone(true)
        console.log(`Session with id: '${session.id}' finished.`)
        alert('Game finished!\nClick on leaderboard for final standings.')
    }
    // when user joins game
    const joinGame = (e) => {
        e.preventDefault()
        socket.emit('joinSession', {
            gameId: gameId.fields.value,
            color: color.fields.value
        })
    }
    // when tile is clicked
    const onTileClick = (coor) => {
        
        // if turn is done
        if (turnDone) {
            alert('You have no more moves left.\nPlease wait until next turn.')
        } else {
            // if its first turn
            if (session.game.turn === 1) {
                const totalMoves = []
                for (let i = 0; i < 6; i++) {
                    totalMoves.push({id: socket.id, coor, turn: session.game.turn})
                }
                socket.emit('movesMade', totalMoves)
                setTurnDone(true)
            } else {
                // if move is legal
                if (adjacentToAlly(socket.id, coor, session.game.tiles, thisPlayer.stats.moveDistance)) {
                    // if has IM special
                    if (session.players.find(p => p.id === socket.id).specials.includes('IM')) {
                        const sessionRef = session
                        const tileClicked = sessionRef.game.tiles.find(t => coorEquals(t.id, coor))
                        tileClicked.ownership.find(o => o.id === socket.id).investment++
                        setSession(sessionRef)
                    }
                    const totalMoves = moves.concat({id: socket.id, coor, turn: session.game.turn})
                    // if has moves left
                    if (totalMoves.length < thisPlayer.stats.movesThisTurn) {
                        setMoves(totalMoves)
                    } else {
                        socket.emit('movesMade', totalMoves)
                        setTurnDone(true)
                        setMoves([])
                    }
                } else {
                    alert('Must place next to a tile you own')
                }
            }
        }
    }
    // html and css
    let showInJoinGame = () => {
        if (!session) {
            return (
                <form onSubmit={(e) => joinGame(e)} style={{display: 'grid', gridTemplateColumns: 'auto auto', justifyContent: 'start'}}>
                    <label htmlFor='gameId'>session id:</label>
                    <input id='gameId' {...gameId.fields} />
                    <label htmlFor='color'>color:</label>
                    <input id='color' {...color.fields} />
                    <button type='submit'>submit</button>
                </form>
            ) 
        }
        else if (session.state === 'waiting for players') {
            return <p>waiting for players...</p>
        }
        else if (session.state === 'game started') {
            let pos = [35, 35]
            let size = 30
            const stageProps = {
                width: Math.sqrt(3) * size * session.map.dimensions[0] + pos[0] + 5,
                height: session.map.dimensions[1] * 0.75 * size * 2 + pos[1] + 5,
                options: {
                  transparent: true,
                  antialias: true
                },
                renderOnComponentChange: false
            }
            const specialsDictionary = () => {
                const dictionary = {
                    '+6': 'adds 6 moves to your total moves for 1 turn after you have captured it',
                    'skip': 'enables one to move 2 units away from an ally tile for 1 turn after you have captured it',
                    'IM': 'moves are updated instantly for the player who captures it for 1 turn after you have captured it',
                }
                let specialTypes = session.game.specials.filter(s => s.coor && s.usage > 0).map(s => s.type)
                specialTypes = specialTypes.filter((s, pos) => specialTypes.indexOf(s) === pos)
                console.log(specialTypes)
                return specialTypes.map(s => <li><strong>{s}: </strong>{dictionary[s]}</li>)
            }
            return (
                <div>
                    <h3>Turn {session.game.turn}/{session.turns}</h3>
                    <Leaderboard session={session} />
                    <h3>Specials:</h3>
                    <ul>
                        {specialsDictionary()}
                    </ul>
                    <hr />
                    <div style={{display: 'grid', gridTemplateColumns: 'auto auto', columnGap: '10px', justifyContent: 'start', alignItems: 'center'}}>
                        <h3>You are </h3>
                        <div style={{backgroundColor: session.players.find(p => p.id === socket.id).color, height: '20px', width: '20px', borderRadius: '20px', border: '2px solid #ffffff'}} />
                    </div>
                    <h3>Moves left: {turnDone ? 0 : session.game.turn === 1 ? 1 : thisPlayer.stats.movesThisTurn - moves.length}</h3>
                    <h3>My specials: {thisPlayer.specials}</h3>
                    <Stage {...stageProps} >
                        <Map pos={pos} size={size} session={session} onTileClick={onTileClick} />
                    </Stage>
                </div>
            )
        }
    }


    return (
        <div>
            <h1>Join Game</h1>
            {showInJoinGame()}
        </div>
    )
}

export default JoinGame