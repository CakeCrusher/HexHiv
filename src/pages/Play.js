import React, {useState, useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {Stage, Sprite} from '@inlet/react-pixi'
import {Button} from 'react-bootstrap'
import {View} from 'react-native'
import {CopyToClipboard} from 'react-copy-to-clipboard'

import {socket} from '../App'
import {generateColor, useField, adjacentToAlly, coorEquals, rgbToHex, pixiSizeScalar, leaderboard} from '../utils'
import Map from '../components/Map'
import Rectangle from '../components/Rectangle'
import MapText from '../components/MapText'
import Leaderboard from '../components/Leaderboard'
import Loading from '../components/Loading'
import '../style/play.css'

const Play = (props) => {
    const [session, setSession] = useState(null)
    const color = useField('color')

    const [moves, setMoves] = useState([])
    const [turnDone, setTurnDone] = useState(false)
    const [sessionDone, setSessionDone] = useState(false)
    const [showLeaderboard, setShowLeaderboard] = useState(false)
    const [mouseDown, setMouseDown] = useState(false)
    const [clickPosition, setClickPosition] = useState([pixiSizeScalar(90), pixiSizeScalar(165)])
    const [oldMapPos, setOldMapPos] = useState([pixiSizeScalar(90), pixiSizeScalar(165)])
    const [mapPosition, setMapPosition] = useState([pixiSizeScalar(90), pixiSizeScalar(165)])
    const [drag, setDrag] = useState(false)
    const history = useHistory()
    // on unmount
    useEffect(() => {
        return () => {
            socket.emit('exitQueue')
        }
    }, [])


    if (props.id) {
        const thisPlayer = session ? session.players.find(p => p.id === socket.id) : null
        
        socket.on('recieveSession', (data) => {
            setSession(data)
        })
        //socket.on events set
        socket.on('turnDone', (data) => {
            setSession(data)
            setTurnDone(false)
        })
        // when game is over
        if (session && session.game && !sessionDone && session.turns < session.game.turn) {
            setSessionDone(true)
            alert('Game finished!\nClick on leaderboard for final standings.')
        }
        // when user joins game
        const joinGame = (e) => {
            e.preventDefault()
            let currentColor = color.fields.value
            if (!color.fields.value) {
                currentColor = generateColor('#')
                color.assignValue(currentColor)
            }
            socket.emit('joinSession', {
                gameId: props.id,
                color: currentColor
            })
        }
        // tileClick
        // first route the base graphics
        // add utils folder
        // stick utils in there
        const onTileClick = (coor) => {
            if (sessionDone) {
                alert('Game is over you may no longer make moves.\nReturn home to start a new game.')
            } else if (turnDone) {
                // if turn is done
                alert('You have no more moves left.\nPlease wait until next turn.')
            } else {
                // if its first turn
                if (session.game.turn === 1) {
                    const totalMoves = []
                    totalMoves.push({id: socket.id, coor, turn: session.game.turn})
                    setMoves(totalMoves)
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
                        const currentMoves = totalMoves.filter(m => m.turn === session.game.turn)
                        // if is final move
                        
                        setMoves(totalMoves)
                        if (currentMoves.length >= thisPlayer.stats.movesThisTurn) {
                            socket.emit('movesMade', currentMoves)
                            setTurnDone(true)
                        }
                        // if (currentMoves.length < thisPlayer.stats.movesThisTurn) {
                        //     setMoves(totalMoves)
                        // } else {
                        //     setMoves(totalMoves)
                        //     socket.emit('movesMade', currentMoves)
                        //     setTurnDone(true)
                        // }
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
                    <div className='page-content'>
                        <div className='p-container'>
                            <h2 className='page-title'>Play</h2>
                            <form style={{justifyContent: 'center'}} className='form' onSubmit={(e) => joinGame(e)}>
                                <label htmlFor='color'>color:</label>
                                <input id='color' {...color.fields} />
                                <Button className='submit-btn' type='submit' variant="success">enter game</Button>
                            </form>
                            <br/>
                            <div className='note'>(you may not enter the game if it is already in progress)</div>
                        </div>
                    </div>
                ) 
            }
            else if (session.state === 'waiting for players') {
                return (
                    <div className='page-content'>
                        <div className='p-container'>
                            <Loading color={color.fields.value} text={`Waiting for ${session.playerAmount - session.players.length} players: `} />
                            <h5>Invite your friends by by sharing this link</h5>
                            <CopyToClipboard text={window.location.href}>
                                <Button className='primary-btn' variant="primary">copy link to clipboard</Button>
                            </CopyToClipboard>
                        </div>
                    </div>
                )
            }
            else if (session.state === 'game started') {
                const size = 30
                const offset = [0, 75]
                const stageProps = {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    options: {
                        transparent: true,
                        antialias: true
                    },
                    renderOnComponentChange: false
                }
                const timeInfo = session.timer ? `    Timer: ${8 + (session.game.turn * 2)}s` : ''
                const myColor = session.players.find(p => p.id === socket.id).color
                const movesRemaining = turnDone ? 0 : session.game.turn === 1 ? 1 : thisPlayer.stats.movesThisTurn - moves.filter(m => m.turn === session.game.turn).length
                const mySpecials = thisPlayer.specials.length ? thisPlayer.specials.join(', ') : 'none'
                const hasXray = thisPlayer.specials.includes('X')

                const onMouseDown = (e) => {
                    if (!mouseDown) {
                        setClickPosition([Math.round(e.pageX), Math.round(e.pageY)])
                        setOldMapPos(mapPosition)
                        setMouseDown(true)
                    }
                }
                const onMouseMove = (e) => {
                    if (mouseDown) {
                        if (!drag) {
                            setDrag(true)
                        }
                        const offsetX = Math.round(e.pageX) - clickPosition[0]
                        const offsetY = Math.round(e.pageY) - clickPosition[1]
                        setMapPosition([oldMapPos[0] + offsetX, oldMapPos[1] + offsetY])
                    }
                }
                const onMouseUp = () => {
                    setMouseDown(false)
                    setDrag(false)
                }
                const infoInDepth = () => {
                    const players = leaderboard(session.players, session.game.tiles)
                    const ownershipMoves = Math.floor(players.find(p => p.id === socket.id).points / 2)
                    const specialMoves = thisPlayer.specials.includes('AM') ? Math.floor(session.game.turn / 2) : 0
                    const movesFromTO = session.game.turn !== 1 ? thisPlayer.stats.movesThisTurn - (ownershipMoves + specialMoves + 1) : 0
                    const fullString = 
`Moves
    -From tile ownership: ${ownershipMoves}
    -From tiles taken over: ${movesFromTO}
    -From specials: ${specialMoves}
    -Base: 1

Specials
    -AM(Add Moves): Adds half of the amount of turns in moves to use next turn only.
    -X(X-ray): Gives you visibily of all your opponents clicks on their tiles for two turns.
    -S(Skip): Enables one to move 2 units away from an ally tile for 1 turn after you have captured it.
    -IM(Instant Moves): Moves are updated instantly for the player who captures it for 1 turn after you have captured it.`
                    alert(fullString)
                }
                return (
                    <div className='play-stage'>
                        <View 
                            onStartShouldSetResponder={() => true}
                            onResponderGrant={(e) => onMouseDown(e.nativeEvent)}
                            onResponderMove={(e) => onMouseMove(e.nativeEvent)}
                            onResponderRelease={() => onMouseUp()}
                            onResponderTerminationRequest={() => true}
                        >
                            <Stage {...stageProps} >
                                <Map pos={mapPosition} size={pixiSizeScalar(size)} session={session} mySocket={socket.id} moves={moves} xray={hasXray} dragging={drag} onTileClick={onTileClick} >
                                    <Rectangle doOnClick={infoInDepth} fill={rgbToHex(myColor)} x={0} y={0} width={stageProps.width} height={pixiSizeScalar(50  + offset[1])} />
                                    <MapText text={`Turn: ${session.game.turn}/${session.turns}    Moves: ${movesRemaining}    Specials: ${mySpecials}${timeInfo}`} x={pixiSizeScalar(10)} y={pixiSizeScalar(10 + offset[1])} bgColor={myColor} fontSize={pixiSizeScalar(22)} evenSmaller={true} />
                                    <Sprite tap={() => setShowLeaderboard(!showLeaderboard)} mouseover={() => setShowLeaderboard(true)} mouseout={() => setShowLeaderboard(false)} interactive={true} scale={{ x: pixiSizeScalar(6) / 100, y: pixiSizeScalar(6) / 100 }} anchor={0.5} x={pixiSizeScalar(30)} y={pixiSizeScalar(80 + offset[1])} image={"https://image.flaticon.com/icons/svg/1152/1152810.svg"} />
                                    <Leaderboard visible={showLeaderboard} position={[pixiSizeScalar(10), pixiSizeScalar(110 + offset[1])]} session={session} />
                                </Map>
                            </Stage>
                        </View>
                    </div>
                )
            }
        }
        return showInJoinGame()
    } else {
        socket.emit('joinQueue')

        socket.on('matchFound', (data) => {
            history.push(`/play/${data}`)
        })

        return(
            <div className='page-content'>
                <div className='p-container'>
                    <h2 className='page-title'>Play</h2>
                    <Loading text={`Searching for games: `} />
                </div>
            </div>
        )
    }

}

export default Play