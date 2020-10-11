import React, {useState} from 'react';
import { Stage } from '@inlet/react-pixi'
import {useMutation} from '@apollo/client'
import {Button, ButtonGroup, ToggleButton} from 'react-bootstrap'

import Hexagon from '../components/Hexagon'
import {MAKE_MAP} from '../schema/mutations'
import {useField, coorEquals, pixiSizeScalar} from '../utils'
import '../style/createMap.css'


const CreateMap = () => {
  const sizes = [
    {name: 'small', size: [7,7]},
    {name: 'medium', size: [11,11]},
    {name: 'large', size: [15,15]}
  ]
  const smallSize = sizes.find(s => s.name === 'small')
  const [dimensions, setDimensions] = useState(smallSize.size)
  const [map, setMap] = useState(Array(smallSize.size[0] * smallSize.size[1]).fill(false))
  const name = useField('text')

  const [mouseDown, setMouseDown] = useState(false)
  const [draggedState, setDraggedState] = useState(false)

  let pos = [pixiSizeScalar(35),pixiSizeScalar(35)]
  let size = pixiSizeScalar(30)

  const [makeMap] = useMutation(MAKE_MAP)


  const setMapSize = (mapName) => {
    // e.preventDefault()
    const mapType = sizes.find(s => s.name === mapName)
    setDimensions(mapType.size)
    setMap(Array(mapType.size[0] * mapType.size[1]).fill(false))
  }
  const getMapSize = () => {
    if (coorEquals(dimensions, [7,7])) return 'small'
    if (coorEquals(dimensions, [11,11])) return 'medium'
    if (coorEquals(dimensions, [15,15])) return 'large'
  }
  
  const stageProps = {
    width: Math.sqrt(3) * size * dimensions[0] + pos[0] + 5,
    height: dimensions[1] * 0.75 * size * 2 + pos[1] + 5,
    options: {
      transparent: true,
      antialias: true
    },
    renderOnComponentChange: false
  }
  const toggleHex = (index) => {
    const newMap = [...map]
    newMap[index] = !newMap[index]
    setMap(newMap)
  }
  const setDraggedOver = (bool) => {
    setDraggedState(bool)
  }
  const Map = () => {
    let drawMap = []
    for (let y = 0; y < dimensions[1]; y++) {
      for (let x = 0; x < dimensions[0]; x++) {
        const index = y * dimensions[1] + x
        let fillColor
        let borderColor
        if (map[index]) {
          fillColor = '0xffffff'
          borderColor = '0xa8a8a8'
        } else {
          fillColor = '0x282828'
          borderColor = '0x383838'
        }
        let hexX = Math.sqrt(3) * size * x + pos[0]
        let hexY = y * 0.75 * size * 2 + pos[1]
        if (y % 2 === 1) {
          hexX = hexX + Math.sqrt(3) * size / 2
        }
        drawMap.push(<Hexagon style={{cursor: 'pointer'}} fill={fillColor} borderColor={borderColor} x={hexX} y={hexY} size={size} draggedOver={setDraggedOver} draggedOverState={draggedState} triggerOnDrag={() => toggleHex(index)} dragging={mouseDown} key={`${x},${y}`}/>)
      }
    }
    return drawMap
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const response = await makeMap({
      variables: {
        name: name.fields.value,
        dimensions,
        grid: map
      }
    })
    if (response && response.data.makeMap.name) {
      alert(`Map saved as "${response.data.makeMap.name}"`)

      // localStorage
      let allMaps = window.localStorage.getItem('maps') ? JSON.parse(window.localStorage.getItem('maps')) : []
      allMaps.push(response.data.makeMap.name)
      window.localStorage.setItem('maps', JSON.stringify(allMaps))

      setDimensions([7,7])
      name.reset()
      setMap(Array(7 * 7).fill(false))
    } else {
      alert('name is already taken please chose a new one')
    } 
  }

  // const sizes = ['small', 'medium', 'large']

  return (
    <div className='cm-container'>
      <h2 className='page-title'>Create map</h2>
      <form className='form' onSubmit={(e) => onSubmit(e)}>
        <label htmlFor='size'>size: </label>
        <ButtonGroup toggle>
          {sizes.map(s => (
            <ToggleButton
              key={s.name}
              type="radio"
              variant="secondary"
              name="radio"
              value={[s.size]}
              checked={coorEquals(dimensions, s.size)}
              onChange={(e) => setMapSize(s.name)}
            >
              {s.name}
            </ToggleButton>
          ))}
        </ButtonGroup>
        <label htmlFor='name'>name: </label>
        <input id='name' {...name.fields} />
        <p>desgin: ({getMapSize()})</p>
        <div className='stage-wrapper'>
          <div onMouseDown={() => setMouseDown(true)} onMouseLeave={() => setMouseDown(false)} onMouseUp={() => setMouseDown(false)} className='stage-container' >
            <Stage  {...stageProps}>
              <Map />
            </Stage>
          </div>
        </div>
        <Button className='submit-btn' type='submit' variant="success">Create Map</Button>
      </form>
    </div>
  )
}

export default CreateMap;