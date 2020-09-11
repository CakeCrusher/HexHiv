import React from 'react'
import {Button} from 'react-bootstrap'
import {Link} from 'react-router-dom'

import '../style/home.css'

const Home = () => {
    

    return (
        <div className='h-container'>
            <Link to='/play'>
                <Button className='link-btn link-btn-p' variant="outline-primary"><h4>Quickplay</h4></Button>
            </Link>
            <Link to='/rules'>
                <Button className='link-btn link-btn-s' variant="outline-secondary"><h4>Rules</h4></Button>
            </Link>
            <Link to='create-game'>
                <Button className='link-btn link-btn-w' variant="outline-warning"><h4>Create game</h4></Button>
            </Link>
            <Link to='/create-map'>
                <Button className='link-btn link-btn-w' variant="outline-warning"><h4>Create map</h4></Button>
            </Link>
            <a href='https://www.reddit.com/r/HexHiv/hot/' target='_blank' rel="noopener noreferrer">
                <Button className='link-btn link-btn-redd' variant="outline-warning"><h4 className='image-text-title'><img className='reddit-icon' alt='Reddit' src='https://www.flaticon.com/svg/static/icons/svg/2111/2111589.svg' />  Community</h4></Button>
            </a>
            <div style={{height: '100px'}}/>
            <Link style={{opacity: 0.6}} to='/contact'>
                <Button className='link-btn link-btn-s' variant="outline-secondary"><h4>Contact</h4></Button>
            </Link>
        </div>
    )
}

export default Home