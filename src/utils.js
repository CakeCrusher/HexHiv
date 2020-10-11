import React, {useState} from 'react'
import Hexagon from './components/Hexagon'
import TextInHex from './components/TextInHex'

export const useField = (type) => {
    const [value, setValue] = useState('')
    const onChange = (e) => setValue(e.target.value)

    const reset = () => setValue('')

    const assignValue = (hex) => setValue(hex)
    
    return {
        fields: {
            type,
            value,
            onChange
        },
        reset,
        assignValue
    }
}
export const generateColor = (prefix) => {
    return prefix + (function co(lor){   return (lor +=
        [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'][Math.floor(Math.random()*16)])
        && (lor.length === 6) ?  lor : co(lor); })('');
}
export const pointy_hex_corner = (center, size, i) => {
    const angle_deg = 60 * i - 30
    const angle_rad = Math.PI / 180 * angle_deg
    return [
        center.x + size * Math.cos(angle_rad),
        center.y + size * Math.sin(angle_rad),
    ]
}
export const hex_points = (center, size) => {
    let points = []
    for (let i = 0; i < 8; i++) {
        const point = pointy_hex_corner(center, size, i)
        points.push(point[0])
        points.push(point[1])
    }
    return points
}
export const coorEquals = (coor1, coor2) => {
    for (let i in coor1) {
        if (coor1[i] !== coor2[i]) return false
    }
    return true
}
export const surroundingTiles = (coor, tiles) => {
    let x = coor[0]
    let y = coor[1]
    let offset = y%2 === 0 ? -1 : 0 
    let c = tiles.find(t => coorEquals(t.id, coor))
    let tl = tiles.find(t => coorEquals(t.id, [x+offset, y-1]))
    let tr = tiles.find(t => coorEquals(t.id, [x+offset + 1, y-1]))
    let l = tiles.find(t => coorEquals(t.id, [x-1, y]))
    let r = tiles.find(t => coorEquals(t.id, [x+1, y]))
    let bl = tiles.find(t => coorEquals(t.id, [x+offset, y+1]))
    let br = tiles.find(t => coorEquals(t.id, [x+offset + 1, y+1]))
    return [c,tl,tr,l,r,bl,br]
}
export const infoRing = (tile) => {
    let sd = surroundingTiles(tile)
    const tilePosition = (tile) => {
        return [tile.graphic.position._x, tile.graphic.position._y]
    }
    let ringCoordinates = {c: tilePosition(tile),tl: tilePosition(sd.tl),tr: tilePosition(sd.tr),l: tilePosition(sd.l),r: tilePosition(sd.r),bl: tilePosition(sd.bl),br: tilePosition(sd.br)}
    return ringCoordinates
}
export const adjacentToAlly = (userId, coor, tiles, distance) => {
    let adjacentTiles = surroundingTiles(coor, tiles)
    for (let i = 0; i < distance - 1; i++) {
        let newAdjacentTiles = adjacentTiles
        adjacentTiles.forEach(t => {
            if (t) {
                newAdjacentTiles = newAdjacentTiles.concat(surroundingTiles(t.id, tiles))
            }
        })
        adjacentTiles = newAdjacentTiles
    }
    for (const tile of adjacentTiles) {
        if (tile && doesUserOwn(userId, tile.ownership) === true) {
            return true
        }
    }
    return false
}
export const rgbParser = (rgbString) => {
    let parsedStr = rgbString.split('(')[1].slice(0,-1).split(',')
    return {r: Number(parsedStr[0]), g: Number(parsedStr[1]), b: Number(parsedStr[2])}
}
export const zeroTo255 = (num) => {
    return num < 0 ? 0 : num > 255 ? 255 : num
}
export const isDark = (rgbString) => {
    const parsedRGB = rgbParser(rgbString)
    if (((parsedRGB.r + parsedRGB.g + parsedRGB.b) / 3) < 127) {
        return true
    } else {
        return false
    }
}
export const rgbToHex = (rgbString) => {
    let parsedStr = rgbParser(rgbString)
    let r = zeroTo255(parsedStr.r)
    let g = zeroTo255(parsedStr.g)
    let b = zeroTo255(parsedStr.b)
    return "0x" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
export const hexToRgb = (hex) => {
    hex = hex.slice(0,1) === '#'? hex : '#' + hex.slice(2,hex.length)
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return `rgb(${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)})`
}
export const colorShift = (hex, amt) => {
    const rgbString = hexToRgb(hex)
    const parsedColorRgb = rgbParser(rgbString)
    let shiftedColor
    if (isDark(rgbString)) {
        shiftedColor = rgbToHex(`rgb(${parsedColorRgb.r + amt},${parsedColorRgb.g + amt},${parsedColorRgb.b + amt})`)
    } else {
        shiftedColor = rgbToHex(`rgb(${parsedColorRgb.r - amt},${parsedColorRgb.g - amt},${parsedColorRgb.b - amt})`)
    }
    return shiftedColor
}
export const whoOwns = (ownership) => {
    const max = ownership.map(u => u.investment).reduce((max, curr) => Math.max(max, curr))
    const owners = ownership.filter(u => u.investment === max).map(u => u.id)
    return owners
}
export const fillColor = (ownership, players) => {
    const owners = whoOwns(ownership)
    if (owners.length === ownership.length && ownership[0].investment === 0) {
        return '0xffffff'
    } else {
        const userColors = players.filter(p => owners.includes(p.id)).map(p => p.color)
        
        const parsedColors = userColors.map(c => rgbParser(c))
        const r = Math.round(parsedColors.reduce((sum, c) => sum + c.r, 0) / parsedColors.length)
        const g = Math.round(parsedColors.reduce((sum, c) => sum + c.g, 0) / parsedColors.length)
        const b = Math.round(parsedColors.reduce((sum, c) => sum + c.b, 0) / parsedColors.length)
        const rgbString = `rgb(${r},${g},${b})`
        return rgbToHex(rgbString)
    }

}
export const doesUserOwn = (userId, ownership) => {
    const owners = whoOwns(ownership)
    if (owners.length === ownership.length) {
        return false
    } else if (owners.length === 1 && owners.includes(userId)) {
        return true
    }else if (owners.includes(userId)) {
        return 'shared'
    } else {
        return false
    }

}
export const leaderboard = (players, tiles) => {
    players.forEach(p => {
        const thisPlayer  = players.find(pi => pi.id === p.id)
        thisPlayer.points = 0
        tiles.forEach(t => {
            const owns = doesUserOwn(p.id, t.ownership)
            if (owns === 'shared') {
                thisPlayer.points += 0.5
            } else if (owns) {
                thisPlayer.points++
            }
        })
    })
    players.sort((a,b) => b.points - a.points)
    return players
}
export const Map = (props) => {
    const {pos, size, session, onTileClick, randomColor} = props
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

            const gameSpecials = session.game.specials.filter(s => s.turn <= session.game.turn)
            const isSpecialTile = gameSpecials.find(s => coorEquals(s.coor, [x,y]) && s.usage > 0)
            if (isSpecialTile) {
                drawMap.push(<Hexagon fill={color} borderColor="0xffe642" x={hexX} y={hexY} size={size} triggerOnClick={() => onTileClick([x, y])} key={`${x},${y}`}/>)
                drawMap.push(<TextInHex text={isSpecialTile.type} x={hexX} y={hexY} key={`S${x},${y}`} />)
            }
            else if (session.map.grid[y * session.map.dimensions[1] + x]){
                drawMap.push(<Hexagon fill={color} x={hexX} y={hexY} size={size} triggerOnClick={() => onTileClick([x, y])} key={`${x},${y}`}/>)
            } else {
                drawMap.push(<Hexagon fill={color} x={hexX} y={hexY} size={size} triggerOnClick={() => onTileClick([x, y])} startInvisible key={`${x},${y}`}/>)
            }
        }
    }
    return drawMap
}
export const pixiSizeScalar = (num) => {
    if (window.innerWidth < 700) {
        return Math.round(num * 0.3)
    } else {
        return num
    }
}

export const randNum = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
}