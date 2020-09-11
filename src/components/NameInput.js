import {TextInput} from 'pixi-textinput-v5'
import {PixiComponent} from '@inlet/react-pixi'

export default PixiComponent('NameInput', {
    create: props => {
        return new TextInput({
            input: {
                fontSize: '16pt',
                padding: '10px',
                width: '300px',
                color: '#26272E'
            },
            box: {
                default: {fill: 0xE8E9F3, rounded: 16, stroke: {color: 0xCBCEE0, width: 4}},
                focused: {fill: 0xE1E3EE, rounded: 16, stroke: {color: 0xABAFC6, width: 4}},
                disabled: {fill: 0xDBDBDB, rounded: 16}
            }
        })
    },
    applyProps: (instance, oldProps, newProps) => {
        const {x, y, onNameChange} = newProps
        instance.position.set(x, y)
        instance.on('input', str => onNameChange(str))
    }
})
