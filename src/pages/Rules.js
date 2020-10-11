import React from 'react'

import '../style/rules.css'

const Rules = () => {
    

    return (
        <div className='r-container'>
            <h3>Goal<span className='unbold'>: own the most tiles by the end of the game or conquer all other opponents.</span></h3>
            <i>(All rules are excluding specials from consideration)</i>
            <ul>
                <li><strong>All moves are executed</strong> once everyone has used up all their moves or the timer has run out.</li>
                <li><strong>First turn</strong> you may move anywhere on the map.</li>
                <li>You <strong>may only move</strong> on tiles next to tiles you own</li>
                <li>You <strong>can only see</strong> tiles next to tiles you own (including the tiles you own), all other tiles are dark.</li>
                <li><strong>To own a tile</strong> you must have more moves on it than any other player.</li>
                <li><strong>Shared tiles</strong> look like a combination of both the colors but neither player owns that tile.</li>
                <li>If you <strong>take over an opponent's tile</strong> you gain extra moves.</li>
                {/* <li>If you take over a tile you gain extra moves</li>
                <li>Must place tiles next to your own.</li>
                <li>To <strong>control a tile</strong> you must have <strong>more clicks</strong> on it than any of your opponents.</li>
                <li><strong>Each tile</strong> you own is worth <strong>1 point</strong>, tiles shared are worth none.</li>
                <li>Each <strong>pair (2) of tiles</strong> you own gets you <strong>1 extra move</strong>.</li>
                <li>If you <strong>take over</strong> an opponent's tile you <strong>gain moves</strong> based on the amount of clicks they had on it.</li> */}
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