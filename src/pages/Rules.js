import React from 'react'

import '../style/rules.css'

const Rules = () => {
    

    return (
        <div className='r-container'>
            <h3>Goal<span className='unbold'>: own the most tiles by the end of the game</span></h3>
            <i>(All rules are excluding specials from consideration)</i>
            <ul>
                <li>First turn you may place wherever.</li>
                <li>Must place tiles next to your own.</li>
                <li>To <strong>control a tile</strong> you must have <strong>more clicks</strong> on it than any of your opponents.</li>
                <li><strong>Each tile</strong> you own is worth <strong>1 point</strong>, tiles shared are worth none.</li>
                <li>Each <strong>pair (2) of tiles</strong> you own gets you <strong>1 extra move</strong>.</li>
                <li>If you <strong>take over</strong> an opponent's tile you <strong>gain moves</strong> based on the amount of clicks they had on it.</li>
            </ul>
            <h3>Specials</h3>
            <ul>
                <li><strong>AM</strong>(Add Moves): Adds half of the amount of turns in moves for 1 turn after capturing this tile.</li>
                <li><strong>X</strong>(X-ray): Gives you visibily of all your opponents clicks on their tiles for 2 turns after capturing this tile.</li>
                <li><strong>S</strong>(Skip): Enables you to move 2 units away from a tile you own for 1 turn after capturing this tile.</li>
                <li><strong>IM</strong>(Instant Moves): Moves are updated instantly for 1 turn after capturing this tile.</li>
            </ul>
        </div>
    )
}

export default Rules