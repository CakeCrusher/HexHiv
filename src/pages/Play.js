import React, {useState, useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {Stage, Sprite} from '@inlet/react-pixi'
import {Button} from 'react-bootstrap'
import {View} from 'react-native'
import {CopyToClipboard} from 'react-copy-to-clipboard'

import {socket} from '../App'
import {generateColor, useField, adjacentToAlly, coorEquals, rgbToHex, randNum, pixiSizeScalar, leaderboard} from '../utils'
import Map from '../components/Map'
import Rectangle from '../components/Rectangle'
import MapText from '../components/MapText'
import Leaderboard from '../components/Leaderboard'
import Loading from '../components/Loading'
import '../style/play.css'
import { whoOwns } from '../utils'
import {Howl} from 'howler';

const Play = (props) => {
    const [session, setSession] = useState(null)
    const color = useField('color')
    const username = useField('text')

    const [timer, setTimer] = useState(0)
    const [startSound, setStartSound] = useState(false)
    const [moves, setMoves] = useState([])
    const [turnDone, setTurnDone] = useState(false)
    const [sessionDone, setSessionDone] = useState(false)
    const [showLeaderboard, setShowLeaderboard] = useState(true)
    const [mouseDown, setMouseDown] = useState(false)
    const [clickPosition, setClickPosition] = useState([pixiSizeScalar(90), pixiSizeScalar(165)])
    const [oldMapPos, setOldMapPos] = useState([pixiSizeScalar(90), pixiSizeScalar(165)])
    const [mapPosition, setMapPosition] = useState([pixiSizeScalar(90), pixiSizeScalar(165)])
    const [drag, setDrag] = useState(false)
    const history = useHistory()

    const [playerSpectating, setPlayerSpectating] = useState(null)
    // on unmount
    useEffect(() => {
        return () => {
            socket.emit('exitQueue')
        }
    }, [])

    const startSoundPlayer = new Howl({
        src: ['/start.mp3']
    })


    if (props.id) {

        const thisPlayer = session ? session.players.find(p => p.id === socket.id) : null
        
        socket.on('recieveSession', (data) => {
            setSession(data)
        })
        //socket.on events set
        socket.on('turnDone', (data) => {
            if (session && session.game && data.game.turn !== session.game.turn) {
                setSession(data)
                setTurnDone(false)
            }
        })
        // when game is over
        const playersWithPoints = session && session.game ? leaderboard(session.players, session.game.tiles) : null
        if (session && session.game && !sessionDone && (session.turns < session.game.turn || (playersWithPoints && playersWithPoints.filter(p => p.points >= 1).length === 1))) {
            setSessionDone(true)
            alert('Game finished!\nClick on leaderboard for final standings.')
        }
        // when user joins game
        const joinGame = (e) => {
            e.preventDefault()
            if (username.fields.value.includes('(bot)')) {
                alert('username may not include "(bot)"')
            } else {
                let currentColor = color.fields.value
                if (!color.fields.value) {
                    currentColor = generateColor('#')
                    color.assignValue(currentColor)
                }
                if (username.fields.value && username.fields.value !== window.localStorage.getItem('username')) {
                    window.localStorage.setItem('username', username.fields.value)
                }
                const unnamed = `unnamed${randNum(0,99)}`
                if (!username.fields.value) {
                    window.localStorage.setItem('username', unnamed)
                    username.assignValue(unnamed)
                }
                socket.emit('joinSession', {
                    gameId: props.id,
                    color: currentColor,
                    username: username.fields.value ? username.fields.value : unnamed
                })
            }
        }
        // tileClick
        // first route the base graphics
        // add utils folder
        // stick utils in there
        if (session && session.players.length && !session.players.find(p => p.id === playerSpectating) && !playerSpectating) {
            setPlayerSpectating(session.players[0].id)
        }
        const onTileClick = (coor) => {
            if (!thisPlayer) { 
                // finish setting spectator on game
                setPlayerSpectating(whoOwns(session.game.tiles.find(t => coorEquals(t.id, coor)).ownership)[0])
            }
            else if (sessionDone) {
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
            if (!username.fields.value && window.localStorage.getItem('username')) {
                username.assignValue(window.localStorage.getItem('username'))
            }
            if (!session) {
                return (
                    <div className='page-content'>
                        <div className='p-container'>
                            <h2 className='page-title'>Play</h2>
                            <form style={{justifyContent: 'center'}} className='form' onSubmit={(e) => joinGame(e)}>
                                <label htmlFor='color'>color (optional):</label>
                                <input id='color' {...color.fields} />
                                <label htmlFor='username'>username (optional):</label>
                                <input id='username' {...username.fields} />
                                <Button className='submit-btn' type='submit' variant="success">join or rejoin game</Button>
                            </form> 
                            <br/>
                            <div className='note'>(you may not enter the game if there are no slots available)</div>
                            <br/>
                            {/* <Button className='submit-btn' variant="secondary" onClick={() => socket.emit('spectate', {gameId: props.id})}>spectate</Button> */}
                        </div>
                    </div>
                ) 
            }
            else if (session.state === 'waiting for players') {
                const waitTime = Math.round(40 - (props.currentPlayers / 10))
                setInterval(() => {
                    if (timer !== Math.floor((new Date().getTime() - session.date) / 1000)) {
                        setTimer(Math.floor((new Date().getTime() - session.date) / 1000))
                    }
                }, 1000)
                const loadingInfo = session.public ? (
                    <div style={{opacity: 0.7}}>
                        <h5>Estimated wait time: {waitTime * (session.playerAmount - 1)} seconds</h5>
                        <h5>Time elapsed: {timer} seconds</h5>
                    </div>
                ) : null
                return (
                    <div className='page-content'>
                        <div className='p-container'>
                            <Loading color={color.fields.value} text={`Waiting for ${session.playerAmount - session.players.length} players: `} />
                            {loadingInfo}
                            <div style={{height: '20px'}} />
                            <h5>Invite your friends by sharing this link</h5>
                            <CopyToClipboard text={window.location.href}>
                                <Button className='primary-btn' variant="primary">copy link to clipboard</Button>
                            </CopyToClipboard>
                            <div style={{height: '20px'}} />
                            <p><strong>Tip</strong>: click on the stats bar for more information.</p>
                        </div>
                    </div>
                )
            }
            else if (session.state === 'game started') {
                if (!startSound) {
                    setStartSound(true)
                    startSoundPlayer.play()
                }
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
                let myColor 
                let movesRemaining
                let mySpecials
                let hasXray

                // if (thisPlayer) {
                    myColor = session.players.find(p => p.id === socket.id).color
                    movesRemaining = turnDone ? 0 : session.game.turn === 1 ? 1 : thisPlayer.stats.movesThisTurn - moves.filter(m => m.turn === session.game.turn).length
                    mySpecials = thisPlayer.specials.length ? thisPlayer.specials.join(', ') : 'none'
                    hasXray = thisPlayer.specials.includes('X')
                // }

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
                if (!myColor) {
                    return (
                        <div style={{textAlign: 'center'}}>
                            <h3 style={{opacity: 0.8}}>:( Oops something happened</h3>
                            <h3>To rejoin: refresh the page and press the rejoin button</h3>
                        </div>
                    )
                }
                // if (!myColor) {
                //     return (
                //         <div className='play-stage'>
                //             <View 
                //                 onStartShouldSetResponder={() => true}
                //                 onResponderGrant={(e) => onMouseDown(e.nativeEvent)}
                //                 onResponderMove={(e) => onMouseMove(e.nativeEvent)}
                //                 onResponderRelease={() => onMouseUp()}
                //                 onResponderTerminationRequest={() => true}
                //             >
                //                 <Stage {...stageProps} >
                //                     <Map pos={mapPosition} size={pixiSizeScalar(size)} session={session} myTempSocket={playerSpectating} moves={moves} xray={hasXray} dragging={drag} onTileClick={onTileClick} spectating={true} >
                //                         <MapText text={`Turn: ${session.game.turn}/${session.turns}`} x={pixiSizeScalar(10)} y={pixiSizeScalar(10 + offset[1])} bgColor={'rgb(0,0,0)'} fontSize={pixiSizeScalar(22)} evenSmaller={true} />
                //                         <Sprite tap={() => setShowLeaderboard(true)} mouseover={() => setShowLeaderboard(true)} mouseout={() => setShowLeaderboard(true)} interactive={true} scale={{ x: pixiSizeScalar(6) / 100, y: pixiSizeScalar(6) / 100 }} anchor={0.5} x={pixiSizeScalar(30)} y={pixiSizeScalar(80 + offset[1])} image={"https://image.flaticon.com/icons/svg/1152/1152810.svg"} />
                //                         <Leaderboard visible={showLeaderboard} position={[pixiSizeScalar(10), pixiSizeScalar(110 + offset[1])]} session={session} />
                //                     </Map>
                //                 </Stage>
                //             </View>
                //         </div>
                //     )
                // }
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
                                <Map pos={mapPosition} size={pixiSizeScalar(size)} session={session} myTempSocket={socket.id} moves={moves} xray={hasXray} dragging={drag} onTileClick={onTileClick} >
                                    <Rectangle doOnClick={infoInDepth} fill={rgbToHex(myColor)} x={2.5} y={0} width={stageProps.width - 5} height={pixiSizeScalar(50  + offset[1])} />
                                    <MapText text={`Turn: ${session.game.turn}/${session.turns}    Moves: ${movesRemaining}    Specials: ${mySpecials}${timeInfo}`} x={pixiSizeScalar(10)} y={pixiSizeScalar(10 + offset[1])} bgColor={myColor} fontSize={pixiSizeScalar(22)} evenSmaller={true} />
                                    <Sprite tap={() => setShowLeaderboard(!showLeaderboard)} click={() => setShowLeaderboard(!showLeaderboard)} mouseover={() => null} mouseout={() => null} interactive={true} scale={{ x: pixiSizeScalar(6) / 100, y: pixiSizeScalar(6) / 100 }} anchor={0.5} x={pixiSizeScalar(30)} y={pixiSizeScalar(80 + offset[1])} image={"https://image.flaticon.com/icons/svg/1152/1152810.svg"} />
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
        const waitTime = Math.round(40 - (props.currentPlayers / 10))
        return(
            <div className='page-content'>
                <div className='p-container'>
                    <h2 className='page-title'>Play</h2>
                    <Loading text={`Searching for games: `} />
                    <div style={{opacity: 0.7}}>
                        <h5>Estimated wait time: {waitTime} seconds</h5>
                    </div>
                    <div style={{height: '20px'}} />
                    <p><strong>Tip</strong>: click on the stats bar for more information.</p>
                </div>
            </div>
        )
    }

}

export default Play