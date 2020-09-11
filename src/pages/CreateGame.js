import React, {useState} from 'react'
import {Button} from 'react-bootstrap'

import {socket} from '../App'
import {useHistory} from 'react-router-dom'
import {useField} from '../utils'
import {client} from '../index'
import {FIND_MAP} from '../schema/queries'


import '../style/createGame.css'

const CreateGame = () => {
    const [publicGame, setPublicGame] = useState(true)
    const [timer, setTimer] = useState(false)
    const [specials, setSpecials] = useState(true)
    const playerAmount = useField('number')
    const turns = useField('number')
    const map = useField('text')
    const history = useHistory()

    const makeSession = async (e) => {
        e.preventDefault()
        const mapQuery = await client.query({
            query: FIND_MAP,
            variables: {
                name: map.fields.value
            }
        }).catch(err => console.log(`map not found: ${err}`))
        if (mapQuery && mapQuery.data.findMap && Number(playerAmount.fields.value) > 1) {
            const sessionId = Math.random().toString(36).substr(2, 9)
            socket.emit('startSession', {
                id: sessionId,
                public: publicGame,
                timer,
                specials,
                playerAmount: playerAmount.fields.value,
                turns: turns.fields.value,
                map: mapQuery.data.findMap
            })
            playerAmount.reset()
            turns.reset()
            map.reset()
            history.push(`/play/${sessionId}`)
            // alert(`game id: ${sessionId}`)
        } else if (Number(playerAmount.fields.value) < 2) {
            alert('player amount must be greater than 1')
        } else {
            alert('please select a valid map')
        }
    }

    const mapReccomendations = () => {
        let maps = []
        if (Number(playerAmount.fields.value) === 2) {
            maps = ['hexagon_small', 'square_small', 'castle_small']
        } else if (3 <= playerAmount.fields.value && playerAmount.fields.value <= 5) {
            maps = ['hexagon_medium', 'square_medium', 'castle_medium']
        } else if (playerAmount.fields.value > 5) {
            maps = ['hexagon_large', 'square_large', 'castle_large']
        } else {
            maps = ['hexagon_small', 'hexagon_medium', 'hexagon_large']
        }
        return maps
    } 
    const rmHTML = () => {
        const pieces = []
        mapReccomendations().forEach(m => pieces.push(<strong key={m}>{m}, </strong>))
        return (
            <React.Fragment>
                <div>reccomended maps: </div>
                {pieces}
            </React.Fragment>
        )
    }

    return (
        <div className='cg-container'>
            <h2 className='page-title'>Create game</h2>
            <form className='form' onSubmit={(e) => makeSession(e)}>
                <label htmlFor='publicGame'>public:</label>
                <input className='radio-input' id='publicGame' type='checkbox' checked={publicGame} onChange={() => setPublicGame(!publicGame)} />
                <label htmlFor='timer'>timer:</label>
                <input className='radio-input' id='timer' type='checkbox' checked={timer} onChange={() => setTimer(!timer)} />
                <label htmlFor='specials'>specials:</label>
                <input className='radio-input' id='specials' type='checkbox' checked={specials} onChange={() => setSpecials(!specials)} />
                <label htmlFor='playerAmout'>player amout:</label>
                <input id='playerAmout' {...playerAmount.fields}/>
                <label htmlFor='turns'>turns:</label>
                <input id='turns' {...turns.fields}/>
                <label htmlFor='map'>map:</label>
                <input id='map' {...map.fields} />
                <div className='rm-container'>{rmHTML()}</div>
                <Button className='submit-btn' type='submit' variant="success">create game</Button>
            </form>
        </div>
    )
}

export default CreateGame